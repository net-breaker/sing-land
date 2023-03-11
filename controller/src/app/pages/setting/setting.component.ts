import { Component, OnInit } from "@angular/core";
import { ClashService } from "src/app/core/service/clash.service";
import { SettingService } from "src/app/core/service/setting.service";

@Component({
  selector: "app-setting",
  templateUrl: "./setting.component.html",
  styleUrls: ["./setting.component.scss"]
})
export class SettingComponent implements OnInit {
  version: string | undefined;

  constructor(private clashService: ClashService, private settingService: SettingService) {}

  async ngOnInit(): Promise<void> {
    if (await this.clashService.isRunningOrConnected()) {
      this.settingService.getVersion().subscribe({
        next: (version) => {
          this.version = version;
        }
      });
    }
  }
}
