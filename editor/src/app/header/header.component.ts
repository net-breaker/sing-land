import { Component, OnInit } from "@angular/core";
import { ipcRenderer } from "electron";
import { platform } from "os";
import * as path from "path";
import { EventService } from "../core/event.service";
import { UtilsService } from "../core/utils.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {
  platform: string = platform();
  isMaximize = false;
  isAlwaysOnTop = false;

  constructor(private utilsService: UtilsService, private eventService: EventService) {}

  get fileName(): string {
    return path.basename(this.utilsService.filePath);
  }

  ngOnInit(): void {
    // there is a delay
    ipcRenderer.on("window", (event, message) => {
      switch (message) {
        case "maximize":
          this.isMaximize = true;
          break;
        case "unmaximize":
          this.isMaximize = false;
          break;
        // case "pin":
        //   this.isAlwaysOnTop = true;
        //   break;
        // case "unpin":
        //   this.isAlwaysOnTop = false;
        //   break;
      }
    });
  }

  reloadFromDisk(): void {
    this.eventService.emitEvent("RELOAD_FROM_DISK");
  }

  saveToDisk(): void {
    this.eventService.emitEvent("SAVE_TO_DISK");
  }

  /**
   * set window to always on top
   */
  alwaysOnTop(): void {
    ipcRenderer.invoke("window", "affix");
    this.isAlwaysOnTop = !this.isAlwaysOnTop;
  }

  minimize(): void {
    ipcRenderer.invoke("window", "minimize");
  }

  maximize(): void {
    ipcRenderer.invoke("window", "maximize");
  }

  unmaximize(): void {
    ipcRenderer.invoke("window", "unmaximize");
  }

  exit(): void {
    ipcRenderer.invoke("window", "close");
  }
}
