import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ipcRenderer } from "electron";
import { NzModalService } from "ng-zorro-antd/modal";
import { NotificationProvider } from "src/app/core/provider/notification.provider";
import { ProfilesService } from "src/app/core/service/profiles.service";
import { ProfilesAddProvider } from "./profiles-add/profiles-add.provider";

@Component({
  selector: "app-profiles",
  templateUrl: "./profiles.component.html",
  styleUrls: ["./profiles.component.scss"]
})
export class ProfilesComponent implements OnInit {
  @ViewChild("list", { static: true })
  listElement!: ElementRef;
  @ViewChild("drag", { static: true })
  dragElement!: ElementRef;

  dragging = false;
  draggingForOrder = false;

  constructor(
    private modal: NzModalService,
    private notificationProvider: NotificationProvider,
    private profilesService: ProfilesService,
    private profilesAddProvider: ProfilesAddProvider
  ) {}

  ngOnInit(): void {
    this.bindDragEvent();
    this.handleContextMenu();
  }

  /**
   * for
   * 1. order
   * 2. add local profile
   */
  bindDragEvent(): void {
    this.listElement.nativeElement.addEventListener(
      "dragstart",
      () => {
        this.draggingForOrder = true;
      },
      false
    );

    this.listElement.nativeElement.addEventListener(
      "dragend",
      () => {
        if (this.draggingForOrder) {
          this.draggingForOrder = false;
        }
      },
      false
    );

    this.listElement.nativeElement.addEventListener(
      "dragenter",
      (e: any) => {
        if (!this.draggingForOrder) this.dragging = true;
      },
      false
    );

    this.listElement.nativeElement.addEventListener(
      "dragover",
      (e: any) => {
        if (!this.draggingForOrder) this.dragging = true;
      },
      false
    );

    this.dragElement.nativeElement.addEventListener(
      "dragleave",
      () => {
        this.dragging = false;
      },
      false
    );

    this.dragElement.nativeElement.addEventListener(
      "drop",
      (e: any) => {
        this.dragging = false;
        this.profilesAddProvider.addLocalProfile(e.dataTransfer.files);
      },
      false
    );

    this.dragElement.nativeElement.addEventListener("dragover", (event: any) => {
      event.preventDefault();
    });
  }

  handleContextMenu(): void {
    ipcRenderer.on("profiles", (event, operator, profileName) => {
      switch (operator) {
        case "edit":
          const profile = this.profilesService.getProfileByName(profileName);
          profile && this.profilesAddProvider.editProfile(profile);
          break;
        case "coder":
          // TODO open coder
          break;
        case "sync":
          this.profilesService
            .syncProfileByName(profileName)
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
            nzContent: profileName,
            nzOkText: "Yes",
            nzOkType: "primary",
            nzOkDanger: true,
            nzOnOk: async () => await this.profilesService.deleteProfileByName(profileName),
            nzCancelText: "No"
          });
          break;
      }
    });
  }

  ngOnDestroy(): void {
    ipcRenderer.removeAllListeners("profiles");
  }
}
