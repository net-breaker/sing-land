import { Component, OnInit } from "@angular/core";
import { profile } from "console";
import { ipcRenderer } from "electron";
import { NzContextMenuService, NzDropdownMenuComponent } from "ng-zorro-antd/dropdown";
import { NzModalService } from "ng-zorro-antd/modal";
import { Observable } from "rxjs";
import { NotificationProvider } from "src/app/core/provider/notification.provider";
import { FileProfile, Profile, ProfilesService, RemoteProfile } from "src/app/core/service/profiles.service";
import { ProfilesAddProvider } from "../profiles-add/profiles-add.provider";

@Component({
  selector: "app-profiles-list",
  templateUrl: "./profiles-list.component.html",
  styleUrls: ["./profiles-list.component.scss"]
})
export class ProfilesListComponent implements OnInit {
  profilesObservable: Observable<Profile[]>;

  contextFileProfile: FileProfile | null = null;
  contextRemoteProfile: RemoteProfile | null = null;

  constructor(
    private modal: NzModalService,
    private nzContextMenuService: NzContextMenuService,
    private notificationProvider: NotificationProvider,
    private profilesService: ProfilesService,
    private profilesAddProvider: ProfilesAddProvider
  ) {
    this.profilesObservable = profilesService.profiles$;
  }

  ngOnInit(): void {}

  contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent, profile: Profile): void {
    this.contextFileProfile = profile.type === "file" ? (profile as FileProfile) : null;
    this.contextRemoteProfile = profile.type === "remote" ? (profile as RemoteProfile) : null;
    this.nzContextMenuService.create($event, menu);
  }

  contextMenuClick(operator: string): void {
    const profile = (this.contextFileProfile || this.contextRemoteProfile)!;
    switch (operator) {
      case "edit":
        this.profilesAddProvider.editProfile(profile);
        break;
      case "coder":
        const file = profile as FileProfile;
        ipcRenderer.invoke("coder", file.path);
        break;
      case "sync":
        this.profilesService
          .syncProfileByName(profile.name)
          .then(() => {
            this.notificationProvider.notification("Sync profile success", "success");
          })
          .catch((err) => {
            this.notificationProvider.notification("Sync profile failed", err.message);
          });
        break;
      case "delete":
        this.modal.confirm({
          nzTitle: "Are you sure delete this profile?",
          nzContent: profile.name,
          nzOkText: "Yes",
          nzOkType: "primary",
          nzOkDanger: true,
          nzOnOk: async () => await this.profilesService.deleteProfileByName(profile.name),
          nzCancelText: "No"
        });
        break;
    }
  }
}
