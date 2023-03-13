import { Injectable } from "@angular/core";
import { getLogger } from "log4js";
import { delay, merge } from "rxjs";
import { SingboxManager } from "../manager/singbox.manager";
import { FileProfile, Profile, ProfilesService, RemoteProfile } from "./profiles.service";

@Injectable({
  providedIn: "root"
})
export class SingboxService {
  private logger = getLogger("SingboxService");

  localSingboxStatusChanged$ = this.singboxManager.localSingboxStatusChanged$;
  remoteSingboxStatusChanged$ = this.singboxManager.remoteSingboxStatusChanged$;
  singboxStatusChanged$ = merge(this.localSingboxStatusChanged$, this.remoteSingboxStatusChanged$);

  localSingboxLogs$ = this.singboxManager.localSingboxLogs$;

  constructor(private profilesService: ProfilesService, private singboxManager: SingboxManager) {
    this.profilesService.profileSelectedChanged$.subscribe((profile) => {
      if (profile === undefined) {
        this.singboxManager.stopLocalSingboxOrDisconnectRemoteSingbox();
      } else {
        const type = profile.type === "file" ? "file profile" : "remote profile";
        this.logger.info(`profile selected changed to ${type}: `, profile?.id);
        this.changeProfile(profile);
      }
    });
  }

  isRunningOrConnected(): Promise<boolean> {
    return new Promise((resolve) => {
      let times = 2;
      const subscription = this.singboxStatusChanged$.pipe(delay(300)).subscribe({
        next: (status) => {
          if (status === "running" || status === "connected") {
            subscription.unsubscribe();
            resolve(true);
          } else if (--times === 0) {
            subscription.unsubscribe();
            resolve(false);
          }
        }
      });
    });
  }

  private async changeProfile(profile: Profile): Promise<void> {
    if (profile.type === "file") {
      const fileProfile = profile as FileProfile;
      await this.singboxManager.startOrConnectSingbox({
        singboxType: "local",
        profilePath: fileProfile.path
      });
    } else if (profile.type === "remote") {
      const remoteProfile = profile as RemoteProfile;
      await this.singboxManager.startOrConnectSingbox({
        singboxType: "remote",
        schema: remoteProfile.schema,
        host: remoteProfile.host,
        port: remoteProfile.port,
        authorization: remoteProfile.authorization
      });
    }
  }
}
