import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NotificationProvider } from "../provider/notification.provider";
import { ConfigInfrastructure } from "./config.infrastructure";
import { ConfigInfrastructureImpl } from "./impl/config.infrastructure.impl";
import { LoggerInfrastructureImpl } from "./impl/logger.infrastructure.impl";
import { SettingInfrastructureImpl } from "./impl/setting.infrastructure.impl";
import { SingboxInfrastructureImpl } from "./impl/singbox.infrastructure.impl";
import { LoggerInfrastructure } from "./logger.infrastructure";
import { SettingInfrastructure } from "./setting.infrastructure";
import { SingboxInfrastructure } from "./singbox.infrastructure";

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
      provide: SingboxInfrastructure,
      useFactory: (notificationProvider: NotificationProvider, configInfrastructure: ConfigInfrastructure, settingInfrastructure: SettingInfrastructure) =>
        new SingboxInfrastructureImpl(notificationProvider, configInfrastructure, settingInfrastructure),
      deps: [NotificationProvider, ConfigInfrastructure, SettingInfrastructure]
    }
  ]
})
export class InfrastructureModule {
  constructor() {}
}
