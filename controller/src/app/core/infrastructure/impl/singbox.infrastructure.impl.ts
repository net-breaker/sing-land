import dayjs from "dayjs";
import { execa, ExecaChildProcess } from "execa";
import * as fs from "fs";
import { getLogger } from "log4js";
import * as os from "os";
import * as path from "path";
import { BehaviorSubject, skip, timer } from "rxjs";
import { Stream } from "stream";
import { NotificationProvider } from "../../provider/notification.provider";
import { ConfigInfrastructure } from "../config.infrastructure";
import { SettingInfrastructure } from "../setting.infrastructure";
import { Log, LogLevel, SingboxInfrastructure, SingboxStatus } from "../singbox.infrastructure";

const logger = getLogger("SingboxInfrastructure");
const singboxLogger = getLogger("sing-box");

export class SingboxInfrastructureImpl implements SingboxInfrastructure {
  private platform = os.platform();
  private singboxFileName = this.platform === "win32" ? "sing-box.exe" : "sing-box";

  private singboxStatusChangedBehaviorSubject = new BehaviorSubject<SingboxStatus>("stopped");
  singboxStatusChanged$ = this.singboxStatusChangedBehaviorSubject.asObservable();

  private singboxLogsBehaviorSubject = new BehaviorSubject<Log | null>(null);
  singboxLogs$ = this.singboxLogsBehaviorSubject.asObservable();

  private singboxProcess: ExecaChildProcess<string> | undefined;

  /**
   * path of the resource singbox
   */
  private resourcesSingboxPath = path.join("resources", "sing-box", this.singboxFileName);

  /**
   * path of the runtime singbox
   */
  private singboxPath = path.join(this.configInfrastructure.singboxDirectory, this.singboxFileName);

  constructor(private notificationProvider: NotificationProvider, private configInfrastructure: ConfigInfrastructure, private settingInfrastructure: SettingInfrastructure) {
    this.singboxStatusChangedBehaviorSubject
      .asObservable()
      .pipe(skip(1))
      .subscribe({
        next: (status) => {
          logger.info(`singbox status has been changed: ${status}`);
          switch (status) {
            case "stopped":
              if (this.currentStatus !== "stopping") {
                logger.error(`singbox exited unexpectedly, will restart it after 3 seconds`);
                setTimeout(() => {
                  if (this.currentStatus === "stopped") this.startSingbox(this.currentProfilePath!);
                }, 3000);
              }
              break;
            default:
              break;
          }
          this.currentStatus = status;
        }
      });
  }

  currentStatus: SingboxStatus = "stopped";
  private currentProfilePath: string | undefined;

  public async startSingbox(profilePath: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.currentStatus === "running") {
        logger.error("Singbox is already running");
        reject("Singbox is already running");
        return;
      }
      try {
        // install singbox if not installed or version not latest
        this.makeSureInstalledSingboxVersionIsLatest();
        // start singbox process
        this.singboxStatusChangedBehaviorSubject.next("starting");
        const args = ["run", "--directory", this.configInfrastructure.singboxDirectory, "--config", profilePath, "--disable-color"];
        logger.info("The sing-box configuration directory is: ", this.configInfrastructure.singboxDirectory);
        logger.info("Start sing-box with command: ", this.singboxPath, args.join(" "));
        this.singboxProcess = execa(this.singboxPath, args, {
          cwd: this.configInfrastructure.singboxDirectory,
          // windowsHide: true,
          cleanup: true,
          detached: false,
          stdin: "ignore"
        });
        this.singboxProcess.stdout!.pipe(
          new Stream.Writable({
            write: (chunk, encoding, callback) => {
              const lines = chunk.toString().split("\n");
              this.outputSingboxLog(lines);
              callback();
            }
          })
        );
        this.singboxProcess.stderr!.pipe(
          new Stream.Writable({
            write: (chunk, encoding, callback) => {
              const lines = chunk.toString().split("\n");
              this.outputSingboxLog(lines);
              callback();
            }
          })
        );
        this.singboxProcess.addListener("exit", (code, signal) => {
          if (code !== 0 && code !== null) {
            logger.error("Singbox is exited with code: ", code);
          }
          this.singboxStatusChangedBehaviorSubject.next("stopped");
        });
        this.currentProfilePath = profilePath;
        this.singboxStatusChangedBehaviorSubject.next("running");
      } catch (e) {
        this.singboxStatusChangedBehaviorSubject.next("stopped");
        logger.error("Start singbox failed: ", e);
        reject(e);
      }
    });
  }

  async restartSingbox(profilePath: string): Promise<void> {
    await this.stopSingbox();
    await this.startSingbox(profilePath);
  }

  stopSingbox(): Promise<void> {
    if (this.currentStatus !== "running") return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.singboxStatusChangedBehaviorSubject.next("stopping");
      const killResult = this.singboxProcess!.kill();
      if (!killResult) {
        reject();
        return;
      }
      const subscription = timer(1000, 3000).subscribe({
        next: () => {
          if (this.singboxProcess!.killed) {
            subscription.unsubscribe();
            resolve();
          }
        }
      });
    });
  }

  /**
   * sing-box log
   *
   * group 1: time zone
   * group 2: datetime
   * group 3: log level
   * group 4: log message
   *
   * example
   * +0800 2023-03-11 23:08:57 INFO sing-box started (0.99s)
   * +0800 2023-03-11 23:08:57 INFO [417259650] inbound/tun[tun-sing-box]: inbound packet connection from 172.19.0.1:58126
   * FATAL[0000] decode config: json: unknown field "encrypted"
   */
  private singboxLogRegex = /^(\+\d{4})?\s?(\d{4}\-\d{2}\-\d{2}\s\d{2}:\d{2}:\d{2})?\s?([A-Z]*)(\s?\[\d*\]\s?)?\s(.*)$/;

  private outputSingboxLog(lines: string[]) {
    lines.forEach((line: string) => {
      if (line.trim() === "") return;
      const match = line.match(this.singboxLogRegex);
      if (match !== null) {
        const log: Log = {
          level: match[3] as LogLevel,
          time: match[2]!,
          message: match[5]
        };
        this.singboxLogsBehaviorSubject.next(log);
        switch (log.level) {
          case "INFO":
          case "PANIC":
          case "UNKNOWN":
            singboxLogger.info(log.message);
            break;
          case "WARN":
            singboxLogger.warn(log.message);
            break;
          case "ERROR":
            singboxLogger.error(log.message);
            break;
          case "TRACE":
            singboxLogger.trace(log.message);
            break;
          case "DEBUG":
            singboxLogger.debug(log.message);
            break;
          case "FATAL":
            singboxLogger.fatal(log.message);
            this.singboxStatusChangedBehaviorSubject.next("stopping");
            this.notificationProvider.notification("Singbox Fatal Error", log.message);
            break;
          default:
            singboxLogger.warn(log.message);
            break;
        }
      } else {
        const time = Date.now();
        const log: Log = {
          level: "UNKNOWN",
          time: dayjs(time).locale("zh-cn").format("YYYY-MM-DD HH:mm:ss"),
          message: line
        };
        this.singboxLogsBehaviorSubject.next(log);
        singboxLogger.warn(line);
      }
    });
  }

  private makeSureInstalledSingboxVersionIsLatest(): void {
    const programInstalled = this.isSingboxInstalled;
    const programVersionMatched = this.settingInfrastructure.getSingboxInstalledVersion() === this.configInfrastructure.singboxVersionInPackage;
    if (!programInstalled || !programVersionMatched) {
      this.installSingbox();
      this.settingInfrastructure.setSingboxInstalledVersion(this.configInfrastructure.singboxVersionInPackage);
    }
  }

  get isSingboxInstalled(): boolean {
    return fs.existsSync(this.singboxPath);
  }

  private installSingbox(): void {
    this.singboxStatusChangedBehaviorSubject.next("installing");
    fs.readdirSync(this.configInfrastructure.singboxDirectory).forEach((file) => {
      fs.unlinkSync(path.join(this.configInfrastructure.singboxDirectory, file));
    });
    fs.copyFileSync(this.resourcesSingboxPath, this.singboxPath);
    fs.chmodSync(this.singboxPath, "755");
  }
}
