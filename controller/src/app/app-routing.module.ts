import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AboutComponent } from "./pages/about/about.component";
import { ConnectionComponent } from "./pages/connection/connection.component";
import { GeneralComponent } from "./pages/general/general.component";
import { LogsComponent } from "./pages/logs/logs.component";
import { ProfilesComponent } from "./pages/profiles/profiles.component";
import { ProxyComponent } from "./pages/proxy/proxy.component";
import { RuleComponent } from "./pages/rule/rule.component";
import { SettingComponent } from "./pages/setting/setting.component";

const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "/proxy" },
  { path: "general", component: GeneralComponent },
  { path: "profiles", component: ProfilesComponent },
  { path: "proxy", component: ProxyComponent },
  { path: "rule", component: RuleComponent },
  { path: "connection", component: ConnectionComponent },
  { path: "log", component: LogsComponent },
  { path: "setting", component: SettingComponent },
  { path: "about", component: AboutComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
