import { Component, OnInit } from "@angular/core";
import { SettingService } from "src/app/core/service/setting.service";
import { SingboxService } from "src/app/core/service/singbox.service";

@Component({
  selector: "app-setting",
  templateUrl: "./setting.component.html",
  styleUrls: ["./setting.component.scss"]
})
export class SettingComponent implements OnInit {
  version: string | undefined;

  constructor(private singboxService: SingboxService, private settingService: SettingService) {}

  async ngOnInit(): Promise<void> {
    if (await this.singboxService.isRunningOrConnected()) {
      this.settingService.getVersion().subscribe({
        next: (version) => {
          this.version = version;
        }
      });
    }
  }
}
