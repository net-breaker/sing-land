import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ClashInfrastructure } from "../infrastructure/clash.infrastructure";
import { ConfigInfrastructure } from "../infrastructure/config.infrastructure";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { SettingInfrastructure } from "../infrastructure/setting.infrastructure";
import { ClashManager } from "./clash.manager";
import { ConfigManager } from "./config.manager";
import { SettingManager } from "./setting.manager";

@NgModule({
  declarations: [],
  imports: [CommonModule, InfrastructureModule],
  providers: [
    {
      provide: ClashManager,
      useFactory: (clashInfrastructure: ClashInfrastructure) => new ClashManager(clashInfrastructure),
      deps: [ClashInfrastructure]
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
