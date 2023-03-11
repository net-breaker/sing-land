import { getLogger } from "log4js";
import { BehaviorSubject, firstValueFrom, timer } from "rxjs";
import { ClashInfrastructure } from "../infrastructure/clash.infrastructure";

export type ClashType = "local" | "remote";
export type RemoteClashStatus = "connected" | "disconnected";

export interface ClashStartRequest {
  clashType: ClashType;
}

export interface LocalClashStartRequest extends ClashStartRequest {
  clashType: "local";
  profilePath: string;
}

export interface RemoteClashStartRequest extends ClashStartRequest {
  clashType: "remote";
  schema: string;
  host: string;
  port: number;
  authorization: string;
}

export class ClashManager {
  private logger = getLogger("ClashManager");

  localClashStatusChanged$ = this.clashInfrastructure.clashStatusChanged$;

  private isRemoteClashConnected: boolean = false;
  private remoteClashStatusChangedBehaviorSubject = new BehaviorSubject<RemoteClashStatus>("disconnected");
  remoteClashStatusChanged$ = this.remoteClashStatusChangedBehaviorSubject.asObservable();

  private schema: string | undefined;
  private host: string | undefined;
  private port: number | undefined;
  get baseUrl(): string {
    if (this.schema === undefined || this.host === undefined || this.port === undefined) throw new Error("clash not configured");
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

  private clashConfigChangedBehaviorSubject = new BehaviorSubject<undefined | true>(undefined);
  clashConfigChanged$ = this.clashConfigChangedBehaviorSubject.asObservable();

  constructor(private clashInfrastructure: ClashInfrastructure) {
    this.clashInfrastructure.clashStatusChanged$.subscribe({
      next: (status) => {
        switch (status) {
          case "running":
            this.schema = "http://";
            this.host = "127.0.0.1";
            this.port = this.clashInfrastructure.currentControllerEntry!.port;
            this.authorizationToken = this.clashInfrastructure.currentControllerEntry!.secret;
            break;
          default:
            break;
        }
      }
    });
  }

  async startOrConnectClash(startRequest: LocalClashStartRequest | RemoteClashStartRequest): Promise<void> {
    if (startRequest.clashType === "local") {
      await this.restartLocalClash(startRequest as LocalClashStartRequest);
    } else {
      await this.connectRemoteClash(startRequest as RemoteClashStartRequest);
    }
    this.resetSystemProxy();
    this.clashConfigChangedBehaviorSubject.next(true);
  }

  private async restartLocalClash(startRequest: LocalClashStartRequest): Promise<void> {
    await this.stopLocalClashOrDisconnectRemoteClash();
    await this.clashInfrastructure.restartClash(startRequest.profilePath);
  }

  private async connectRemoteClash(startRequest: RemoteClashStartRequest): Promise<void> {
    await this.stopLocalClashOrDisconnectRemoteClash();
    this.schema = startRequest.schema;
    this.host = startRequest.host;
    this.port = startRequest.port;
    this.authorizationToken = startRequest.authorization;
    this.isRemoteClashConnected = true;
    this.remoteClashStatusChangedBehaviorSubject.next("connected");
    return Promise.resolve();
  }

  async stopLocalClashOrDisconnectRemoteClash(): Promise<void> {
    if (this.isRemoteClashConnected) {
      this.isRemoteClashConnected = false;
      this.remoteClashStatusChangedBehaviorSubject.next("disconnected");
      // for ui animation transition
      await firstValueFrom(timer(1000));
    }
    if (this.clashInfrastructure.currentStatus === "running") await this.clashInfrastructure.stopClash();
  }

  private resetSystemProxy(): void {
    this.logger.warn("resetSystemProxy not implemented");
  }
}
