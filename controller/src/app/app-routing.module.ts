import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AboutComponent } from "./pages/about/about.component";
import { ProfilesComponent } from "./pages/profiles/profiles.component";
import { SettingComponent } from "./pages/setting/setting.component";

const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "/proxy" },
  { path: "profiles", component: ProfilesComponent },
  { path: "setting", component: SettingComponent },
  { path: "about", component: AboutComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
