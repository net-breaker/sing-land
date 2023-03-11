import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NzTagModule } from "ng-zorro-antd/tag";
import { NetworkTypeTagComponent } from "./network-type-tag.component";

@NgModule({
  declarations: [NetworkTypeTagComponent],
  imports: [CommonModule, NzTagModule],
  exports: [NetworkTypeTagComponent]
})
export class NetworkTypeTagModule {}
