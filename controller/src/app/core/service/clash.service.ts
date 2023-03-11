import { Injectable } from "@angular/core";
import { getLogger } from "log4js";
import { delay, merge } from "rxjs";
import { ClashManager } from "../manager/clash.manager";
import { FileProfile, Profile, ProfilesService, RemoteProfile } from "./profiles.service";

@Injectable({
  providedIn: "root"
})
export class ClashService {
  private logger = getLogger("ClashService");

  localClashStatusChanged$ = this.clashManager.localClashStatusChanged$;
  remoteClashStatusChanged$ = this.clashManager.remoteClashStatusChanged$;
  clashStatusChanged$ = merge(this.localClashStatusChanged$, this.remoteClashStatusChanged$);

  constructor(private profilesService: ProfilesService, private clashManager: ClashManager) {
    this.profilesService.profileSelectedChanged$.subscribe((profile) => {
      if (profile === undefined) {
        this.clashManager.stopLocalClashOrDisconnectRemoteClash();
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
      const subscription = this.clashStatusChanged$.pipe(delay(300)).subscribe({
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
      await this.clashManager.startOrConnectClash({
        clashType: "local",
        profilePath: fileProfile.path
      });
    } else if (profile.type === "remote") {
      const remoteProfile = profile as RemoteProfile;
      await this.clashManager.startOrConnectClash({
        clashType: "remote",
        schema: remoteProfile.schema,
        host: remoteProfile.host,
        port: remoteProfile.port,
        authorization: remoteProfile.authorization
      });
    }
  }
}
