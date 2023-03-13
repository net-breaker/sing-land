import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ConfigInfrastructure } from "../infrastructure/config.infrastructure";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { SettingInfrastructure } from "../infrastructure/setting.infrastructure";
import { SingboxInfrastructure } from "../infrastructure/singbox.infrastructure";
import { ConfigManager } from "./config.manager";
import { SettingManager } from "./setting.manager";
import { SingboxManager } from "./singbox.manager";

@NgModule({
  declarations: [],
  imports: [CommonModule, InfrastructureModule],
  providers: [
    {
      provide: SingboxManager,
      useFactory: (singboxInfrastructure: SingboxInfrastructure) => new SingboxManager(singboxInfrastructure),
      deps: [SingboxInfrastructure]
    },
    {
      provide: ConfigManager,
      useFactory: (configInfrastructure: ConfigInfrastructure) => new ConfigManager(configInfrastructure),
      deps: [ConfigInfrastructure]
    },
    {
      provide: SettingManager,
      useFactory: (settingInfrastructure: SettingInfrastructure) => new SettingManager(settingInfrastructure),
      deps: [SettingInfrastructure]
    }
  ]
})
export class ManagerModule {}
