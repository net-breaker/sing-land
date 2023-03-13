import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AboutComponent } from "./pages/about/about.component";
import { LogsComponent } from "./pages/logs/logs.component";
import { ProfilesComponent } from "./pages/profiles/profiles.component";
import { SettingComponent } from "./pages/setting/setting.component";

const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "/profiles" },
  { path: "profiles", component: ProfilesComponent },
  { path: "logs", component: LogsComponent },
  { path: "setting", component: SettingComponent },
  { path: "about", component: AboutComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
