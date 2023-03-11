import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { ProfilesAddModule } from "./profiles-add/profiles-add.module";
import { ProfilesListModule } from "./profiles-list/profiles-list.module";
import { ProfilesComponent } from "./profiles.component";

@NgModule({
  declarations: [ProfilesComponent],
  imports: [CommonModule, BrowserModule, ProfilesListModule, ProfilesAddModule]
})
export class ProfilesModule { }
