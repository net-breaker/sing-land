import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { PipeModule } from "src/app/pipe/pipe.module";
import { ProfilesItemComponent } from "./profiles-item.component";

@NgModule({
  declarations: [ProfilesItemComponent],
  imports: [CommonModule, PipeModule],
  exports: [ProfilesItemComponent]
})
export class ProfilesItemModule {}
