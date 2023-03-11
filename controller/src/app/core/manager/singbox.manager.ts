import { getLogger } from "log4js";
import { BehaviorSubject, firstValueFrom, timer } from "rxjs";
import { SingboxInfrastructure } from "../infrastructure/singbox.infrastructure";

export type SingboxType = "local" | "remote";
export type RemoteSingboxStatus = "connected" | "disconnected";

export interface SingboxStartRequest {
  singboxType: SingboxType;
}

export interface LocalSingboxStartRequest extends SingboxStartRequest {
  singboxType: "local";
  profilePath: string;
}

export interface RemoteSingboxStartRequest extends SingboxStartRequest {
  singboxType: "remote";
  schema: string;
  host: string;
  port: number;
  authorization: string;
}

export class SingboxManager {
  private logger = getLogger("SingboxManager");

  localSingboxStatusChanged$ = this.singboxInfrastructure.singboxStatusChanged$;

  private isRemoteSingboxConnected: boolean = false;
  private remoteSingboxStatusChangedBehaviorSubject = new BehaviorSubject<RemoteSingboxStatus>("disconnected");
  remoteSingboxStatusChanged$ = this.remoteSingboxStatusChangedBehaviorSubject.asObservable();

  private schema: string | undefined;
  private host: string | undefined;
  private port: number | undefined;
  get baseUrl(): string {
    if (this.schema === undefined || this.host === undefined || this.port === undefined) throw new Error("singbox not configured");
    return `${this.schema}${this.host}:${this.port}`;
  }

  private authorizationToken: string | undefined;
  get authorizationHeaders(): any {
    if (this.authorizationToken === undefined) {
      return undefined;
    } else {
      return {
        Authorization: `Bearer ${this.authorizationToken}`
      };
    }
  }

  private singboxConfigChangedBehaviorSubject = new BehaviorSubject<undefined | true>(undefined);
  singboxConfigChanged$ = this.singboxConfigChangedBehaviorSubject.asObservable();

  constructor(private singboxInfrastructure: SingboxInfrastructure) {
    this.singboxInfrastructure.singboxStatusChanged$.subscribe({
      next: (status) => {
        switch (status) {
          case "running":
            this.schema = "http://";
            this.host = "127.0.0.1";
            this.port = this.singboxInfrastructure.currentControllerEntry!.port;
            this.authorizationToken = this.singboxInfrastructure.currentControllerEntry!.secret;
            break;
          default:
            break;
        }
      }
    });
  }

  async startOrConnectSingbox(startRequest: LocalSingboxStartRequest | RemoteSingboxStartRequest): Promise<void> {
    if (startRequest.singboxType === "local") {
      await this.restartLocalSingbox(startRequest as LocalSingboxStartRequest);
    } else {
      await this.connectRemoteSingbox(startRequest as RemoteSingboxStartRequest);
    }
    this.resetSystemProxy();
    this.singboxConfigChangedBehaviorSubject.next(true);
  }

  private async restartLocalSingbox(startRequest: LocalSingboxStartRequest): Promise<void> {
    await this.stopLocalSingboxOrDisconnectRemoteSingbox();
    await this.singboxInfrastructure.restartSingbox(startRequest.profilePath);
  }

  private async connectRemoteSingbox(startRequest: RemoteSingboxStartRequest): Promise<void> {
    await this.stopLocalSingboxOrDisconnectRemoteSingbox();
    this.schema = startRequest.schema;
    this.host = startRequest.host;
    this.port = startRequest.port;
    this.authorizationToken = startRequest.authorization;
    this.isRemoteSingboxConnected = true;
    this.remoteSingboxStatusChangedBehaviorSubject.next("connected");
    return Promise.resolve();
  }

  async stopLocalSingboxOrDisconnectRemoteSingbox(): Promise<void> {
    if (this.isRemoteSingboxConnected) {
      this.isRemoteSingboxConnected = false;
      this.remoteSingboxStatusChangedBehaviorSubject.next("disconnected");
      // for ui animation transition
      await firstValueFrom(timer(1000));
    }
    if (this.singboxInfrastructure.currentStatus === "running") await this.singboxInfrastructure.stopSingbox();
  }

  private resetSystemProxy(): void {
    this.logger.warn("resetSystemProxy not implemented");
  }
}
