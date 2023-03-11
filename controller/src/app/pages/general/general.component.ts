import { Component, OnInit } from "@angular/core";
import { NotificationProvider } from "src/app/core/provider/notification.provider";
import { ClashConfigs, ClashConfigService, ClashLogLevelType, ClashModeType } from "src/app/core/service/clash-config.service";

@Component({
  selector: "app-general",
  templateUrl: "./general.component.html",
  styleUrls: ["./general.component.scss"]
})
export class GeneralComponent implements OnInit {
  logLevel: ClashLogLevelType[] = ["info", "warning", "error", "debug", "silent"];
  mode: ClashModeType[] = ["global", "rule", "direct"];
  config: any = {};

  constructor(private clashConfigService: ClashConfigService, private notificationProvider: NotificationProvider) {}

  ngOnInit(): void {
    this.reloadConfig();
  }

  reloadConfig(): void {
    const configOnDisk = this.clashConfigService.loadConfigFromDisk();
    this.config.port = configOnDisk.port!.toString();
    this.config.socksPort = configOnDisk["socks-port"]!.toString();
    this.config.redirectPort = configOnDisk["redir-port"]!.toString();
    this.config.transparentProxyPort = configOnDisk["tproxy-port"]!.toString();
    this.config.mixedPort = configOnDisk["mixed-port"]!.toString();
    this.config.ipv6 = configOnDisk.ipv6;
    this.config.allowLan = configOnDisk["allow-lan"];
    this.config.bindAddress = configOnDisk["bind-address"];
    this.config.mode = ["global", "rule", "direct"].indexOf(configOnDisk.mode!);
    this.config.logLevel = ["info", "warning", "error", "debug", "silent"].indexOf(configOnDisk["log-level"]!);
  }

  async handleAnytingChange(): Promise<void> {
    try {
      const clashConfig: ClashConfigs = {
        port: parseInt(this.config.port, 10),
        "socks-port": parseInt(this.config.socksPort, 10),
        "redir-port": parseInt(this.config.redirectPort, 10),
        "tproxy-port": parseInt(this.config.transparentProxyPort, 10),
        "mixed-port": parseInt(this.config.mixedPort, 10),
        authentication: [],
        "allow-lan": this.config.allowLan,
        "bind-address": this.config.bindAddress,
        mode: this.mode[this.config.mode],
        "log-level": this.logLevel[this.config.logLevel],
        ipv6: this.config.ipv6
      };
      this.clashConfigService.updateConfig(clashConfig).subscribe({
        next: () => {
          // ignore
        },
        error: async (err) => {
          this.notificationProvider.notification("Config update failed", err.message);
          this.reloadConfig();
        }
      });
    } catch (e: any) {
      this.notificationProvider.notification("Config update failed", e.message);
      this.reloadConfig();
    }
  }
}
