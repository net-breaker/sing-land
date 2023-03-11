import { Component } from "@angular/core";
import { ipcRenderer } from "electron";
import { getLogger } from "log4js";
import { platform } from "os";
import { debounceTime, Subscription } from "rxjs";
import { ConfigManager } from "./core/manager/config.manager";
import { ClashConfigService } from "./core/service/clash-config.service";
import { ClashService } from "./core/service/clash.service";
import { Traffic, TrafficMonitorService } from "./core/service/monitor-traffic.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  private logger = getLogger("AppComponent");

  isMaximize = false;
  isAlwaysOnTop = false;

  platform: string = "linux";
  version: string = "unknown";
  traffic: Traffic = { up: 0, down: 0 };

  constructor(configManager: ConfigManager, private clashService: ClashService, private clashcService: ClashConfigService, private trafficMonitorService: TrafficMonitorService) {
    this.platform = platform();
    this.version = configManager.version;

    this.clashService.clashStatusChanged$.pipe(
      // selected unmatched local profile
      // cause the animation transitions to look unnatural
      debounceTime(300)
    ).subscribe({
      next: (status) => {
        switch (status) {
          case "connected":
          case "running":
            this.distoryTrafficMonitor();
            this.createTrafficMonitor();
            break;
          default:
            this.distoryTrafficMonitor();
            break;
        }
      }
    });
  }

  trafficMonitor: Subscription | undefined;

  createTrafficMonitor(): void {
    this.traffic = { up: 0, down: 0 };
    this.trafficMonitor = this.trafficMonitorService.traffic$.subscribe({
      next: (traffic) => {
        this.traffic = traffic;
      }
    });
  }

  distoryTrafficMonitor(): void {
    this.trafficMonitor?.unsubscribe();
    this.trafficMonitor = undefined;
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
        // case "affixed":
        //   this.isAlwaysOnTop = true;
        //   break;
        // case "unaffix":
        //   this.isAlwaysOnTop = false;
        //   break;
      }
    });
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
