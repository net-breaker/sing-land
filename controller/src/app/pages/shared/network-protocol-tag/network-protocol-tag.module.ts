import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NzTagModule } from "ng-zorro-antd/tag";
import { NetworkProtocolTagComponent } from "./network-protocol-tag.component";

@NgModule({
  declarations: [NetworkProtocolTagComponent],
  imports: [CommonModule, NzTagModule],
  exports: [NetworkProtocolTagComponent]
})
export class NetworkProtocolTagModule {}
