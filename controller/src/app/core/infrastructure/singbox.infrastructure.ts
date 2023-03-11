import { Observable } from "rxjs";

export interface SingboxProcessControllerEntry {
  port: number;
  secret: string;
}

export type SingboxStatus = "installing" | "starting" | "running" | "stopping" | "stopped";

export abstract class SingboxInfrastructure {
  abstract singboxStatusChanged$: Observable<SingboxStatus>;

  abstract currentStatus: SingboxStatus;
  abstract currentControllerEntry: SingboxProcessControllerEntry | undefined;

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
