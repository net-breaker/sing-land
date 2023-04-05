import { registerLocaleData } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import en from "@angular/common/locales/en";
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { getLogger } from "log4js";
import { NZ_I18N, en_US } from "ng-zorro-antd/i18n";
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzMenuModule } from "ng-zorro-antd/menu";
import * as os from "os";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { InfrastructureModule } from "./core/infrastructure/infrastructure.module";
import { LoggerInfrastructure } from "./core/infrastructure/logger.infrastructure";
import { ManagerModule } from "./core/manager/manager.module";
import { LogMonitorService } from "./core/service/monitor-log.service";
import { IconsProviderModule } from "./icons-provider.module";
import { LogsModule } from "./pages/logs/logs.module";
import { ProfilesModule } from "./pages/profiles/profiles.module";
import { PipeModule } from "./pipe/pipe.module";

registerLocaleData(en);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
    ProfilesModule,
    LogsModule,
    PipeModule,
    InfrastructureModule,
    ManagerModule
  ],
  providers: [
    {
      provide: NZ_I18N,
      useValue: en_US
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [LoggerInfrastructure, LogMonitorService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

export function initializeApp(loggerInfrastructure: LoggerInfrastructure, logMonitorService: LogMonitorService) {
  return async (): Promise<void> => {
    getLogger("APP_INITIALIZER").mark("OS information: ", os.platform(), os.arch());
  };
}
