import { execa, ExecaChildProcess } from "execa";
import * as fs from "fs";
import getPort from "get-port";
import { getLogger } from "log4js";
import * as os from "os";
import * as path from "path";
import { BehaviorSubject, skip, timer } from "rxjs";
import { Stream } from "stream";
import { v4 as uuidv4 } from "uuid";
import { NotificationProvider } from "../../provider/notification.provider";
import { ConfigInfrastructure } from "../config.infrastructure";
import { SettingInfrastructure } from "../setting.infrastructure";
import { SingboxInfrastructure, SingboxProcessControllerEntry, SingboxStatus } from "../singbox.infrastructure";

const logger = getLogger("SingboxInfrastructure");
const singboxLogger = getLogger("Singbox");

export class SingboxInfrastructureImpl implements SingboxInfrastructure {
  private platform = os.platform();
  private singboxFileName = this.platform === "win32" ? "singbox.exe" : "singbox";

  private singboxStatusChangedBehaviorSubject = new BehaviorSubject<SingboxStatus>("stopped");
  singboxStatusChanged$ = this.singboxStatusChangedBehaviorSubject.asObservable();

  private singboxProcess: ExecaChildProcess<string> | undefined;

  /**
   * path of the resource singbox
   */
  private resourcesSingboxPath = path.join("resources", "singbox", this.singboxFileName);
  private resourcesSingboxCountryMMDBPath = path.join("resources", "singbox", "Country.mmdb");

  /**
   * path of the runtime singbox
   */
  private singboxPath = path.join(this.configInfrastructure.singboxDirectory, this.singboxFileName);
  private singboxCountryMMDBPath = path.join(this.configInfrastructure.singboxDirectory, "Country.mmdb");

  constructor(private notificationProvider: NotificationProvider, private configInfrastructure: ConfigInfrastructure, private settingInfrastructure: SettingInfrastructure) {
    this.singboxStatusChangedBehaviorSubject
      .asObservable()
      .pipe(skip(1))
      .subscribe({
        next: (status) => {
          logger.info(`singbox status has been changed: ${status}`);
          switch (status) {
            case "stopped":
              this.currentControllerEntry = undefined;
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
  currentControllerEntry: SingboxProcessControllerEntry | undefined;

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
        const secret = uuidv4().replace(/-/g, "").substring(0, 4);
        const port = await getPort({ port: 9090 });
        const args = ["-d", this.configInfrastructure.singboxDirectory, "-ext-ctl", `localhost:${port}`, "-secret", secret, "-f", profilePath];
        logger.info("The singbox configuration directory is: ", this.configInfrastructure.singboxDirectory);
        logger.info("Start singbox with command: ", this.singboxPath, args.join(" "));
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
        this.currentControllerEntry = { port: port, secret: secret };
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

  singboxLogRegex = /^time=".*" level=(\w+) msg="(.*)"$/;

  private outputSingboxLog(lines: string[]) {
    lines.forEach((line: string) => {
      if (line.trim() === "") return;
      const match = line.match(this.singboxLogRegex);
      if (match !== null) {
        switch (match[1]) {
          case "info":
            singboxLogger.info(match[2]);
            break;
          case "warning":
            singboxLogger.warn(match[2]);
            break;
          case "error":
            singboxLogger.error(match[2]);
            this.notificationProvider.notification("Singbox Error", match[2]);
            break;
          case "trace":
            singboxLogger.trace(match[2]);
            break;
          case "debug":
            singboxLogger.debug(match[2]);
            break;
          case "fatal":
            singboxLogger.fatal(match[2]);
            this.singboxStatusChangedBehaviorSubject.next("stopping");
            this.notificationProvider.notification("Singbox Fatal Error", match[2]);
            break;
          case "mark":
            singboxLogger.mark(match[2]);
            break;
          default:
            singboxLogger.warn("[unknown log level]: ", line);
            break;
        }
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
    fs.copyFileSync(this.resourcesSingboxCountryMMDBPath, this.singboxCountryMMDBPath);
    fs.chmodSync(this.singboxPath, "755");
  }
}
