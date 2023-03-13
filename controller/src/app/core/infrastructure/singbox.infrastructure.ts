import { Observable } from "rxjs";

export interface Log {
  level: LogLevel;
  time: string;
  message: string;
}

export type LogLevel = "INFO" | "PANIC" | "WARN" | "ERROR" | "TRACE" | "DEBUG" | "FATAL" | "UNKNOWN";

export type SingboxStatus = "installing" | "starting" | "running" | "stopping" | "stopped";

export abstract class SingboxInfrastructure {
  abstract singboxStatusChanged$: Observable<SingboxStatus>;
  abstract singboxLogs$: Observable<Log | null>;

  abstract currentStatus: SingboxStatus;

  /**
   * start singbox process
   *
   * @param path path of the config file
   */
  abstract startSingbox(profilePath: string): Promise<void>;

  /**
   * restart singbox process
   *
   * @param path path of the config file
   */
  abstract restartSingbox(profilePath: string): Promise<void>;

  /**
   * kill singbox process
   *
   * @param path path of the config file
   */
  abstract stopSingbox(): Promise<void>;
}
