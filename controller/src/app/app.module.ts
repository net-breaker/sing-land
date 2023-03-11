import { registerLocaleData } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import zh from "@angular/common/locales/zh";
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { getLogger } from "log4js";
import { en_US, NZ_I18N } from "ng-zorro-antd/i18n";
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzMenuModule } from "ng-zorro-antd/menu";
import * as os from "os";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { InfrastructureModule } from "./core/infrastructure/infrastructure.module";
import { LoggerInfrastructure } from "./core/infrastructure/logger.infrastructure";
import { ManagerModule } from "./core/manager/manager.module";
import { IconsProviderModule } from "./icons-provider.module";
import { ConnectionModule } from "./pages/connection/connection.module";
import { GeneralModule } from "./pages/general/general.module";
import { LogsModule } from "./pages/logs/logs.module";
import { ProfilesModule } from "./pages/profiles/profiles.module";
import { ProxyModule } from "./pages/proxy/proxy.module";
import { RuleModule } from "./pages/rule/rule.module";
import { PipeModule } from "./pipe/pipe.module";

registerLocaleData(zh);

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
    GeneralModule,
    ProfilesModule,
    RuleModule,
    ConnectionModule,
    LogsModule,
    ProxyModule,
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
      deps: [LoggerInfrastructure],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

export function initializeApp(loggerInfrastructure: LoggerInfrastructure) {
  return async (): Promise<void> => {
    getLogger("APP_INITIALIZER").mark("OS information: ", os.platform(), os.arch());
  };
}
