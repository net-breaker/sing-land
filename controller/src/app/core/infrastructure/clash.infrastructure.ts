import { Observable } from "rxjs";

export interface ClashProcessControllerEntry {
  port: number;
  secret: string;
}

export type ClashStatus = "installing" | "starting" | "running" | "stopping" | "stopped";

export abstract class ClashInfrastructure {
  abstract clashStatusChanged$: Observable<ClashStatus>;

  abstract currentStatus: ClashStatus;
  abstract currentControllerEntry: ClashProcessControllerEntry | undefined;

  /**
   * start clash process
   *
   * @param path path of the config file
   */
  abstract startClash(profilePath: string): Promise<void>;

  /**
   * restart clash process
   *
   * @param path path of the config file
   */
  abstract restartClash(profilePath: string): Promise<void>;

  /**
   * kill clash process
   *
   * @param path path of the config file
   */
  abstract stopClash(): Promise<void>;
}
