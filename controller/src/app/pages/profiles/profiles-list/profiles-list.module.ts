import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { NzGridModule } from "ng-zorro-antd/grid";
import { ProfilesItemModule } from "../profiles-item/profiles-item.module";
import { ProfilesListComponent } from "./profiles-list.component";

@NgModule({
  declarations: [ProfilesListComponent],
  imports: [CommonModule, NzGridModule, ProfilesItemModule, NzDropDownModule],
  exports: [ProfilesListComponent]
})
export class ProfilesListModule {}
