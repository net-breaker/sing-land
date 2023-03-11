import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NotificationProvider } from "../provider/notification.provider";
import { ClashInfrastructure } from "./clash.infrastructure";
import { ConfigInfrastructure } from "./config.infrastructure";
import { ClashInfrastructureImpl } from "./impl/clash.infrastructure.impl";
import { ConfigInfrastructureImpl } from "./impl/config.infrastructure.impl";
import { LoggerInfrastructureImpl } from "./impl/logger.infrastructure.impl";
import { SettingInfrastructureImpl } from "./impl/setting.infrastructure.impl";
import { LoggerInfrastructure } from "./logger.infrastructure";
import { SettingInfrastructure } from "./setting.infrastructure";

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    {
      provide: ConfigInfrastructure,
      useFactory: () => new ConfigInfrastructureImpl()
    },
    {
      provide: SettingInfrastructure,
      useFactory: (configInfrastructure: ConfigInfrastructure) => new SettingInfrastructureImpl(configInfrastructure.settingDirectory),
      deps: [ConfigInfrastructure]
    },
    {
      provide: LoggerInfrastructure,
      useFactory: (configInfrastructure: ConfigInfrastructure) => new LoggerInfrastructureImpl(configInfrastructure),
      deps: [ConfigInfrastructure]
    },
    {
      provide: ClashInfrastructure,
      useFactory: (notificationProvider: NotificationProvider, configInfrastructure: ConfigInfrastructure, settingInfrastructure: SettingInfrastructure) => new ClashInfrastructureImpl(notificationProvider, configInfrastructure, settingInfrastructure),
      deps: [NotificationProvider,ConfigInfrastructure, SettingInfrastructure]
    }
  ]
})
export class InfrastructureModule {
  constructor() {}
}
