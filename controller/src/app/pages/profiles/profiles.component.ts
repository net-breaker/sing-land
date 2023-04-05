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

  ngOnDestroy(): void {
    ipcRenderer.removeAllListeners("profiles");
  }
}
