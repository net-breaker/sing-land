import { Component } from "@angular/core";
import { platform } from "os";
import { debounceTime } from "rxjs";
import { ConfigManager } from "./core/manager/config.manager";
import { SingboxService } from "./core/service/singbox.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  platform: string = "linux";
  version: string = "unknown";
  status: "running" | "stopped" = "stopped";

  constructor(configManager: ConfigManager, private singboxService: SingboxService) {
    this.platform = platform();
    this.version = configManager.version;

    this.singboxService.singboxStatusChanged$
      .pipe(
        // selected unmatched local profile
        // cause the animation transitions to look unnatural
        debounceTime(300)
      )
      .subscribe({
        next: (status) => {
          switch (status) {
            case "connected":
            case "running":
              this.status = "running";
              break;
            default:
              this.status = "stopped";
              break;
          }
        }
      });
  }

  ngOnInit(): void {}
}
