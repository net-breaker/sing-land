import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { NzDividerModule } from "ng-zorro-antd/divider";
import { NzEmptyModule } from "ng-zorro-antd/empty";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzListModule } from "ng-zorro-antd/list";
import { NzMessageModule } from "ng-zorro-antd/message";
import { NzModalModule } from "ng-zorro-antd/modal";
import { NzSelectModule } from "ng-zorro-antd/select";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { NetworkProtocolTagModule } from "src/app/pages/shared/network-protocol-tag/network-protocol-tag.module";
import { PipeModule } from "src/app/pipe/pipe.module";
import { NetworkTypeTagModule } from "../shared/network-type-tag/network-type-tag.module";
import { ConnectionComponent } from "./connection.component";

@NgModule({
  declarations: [ConnectionComponent],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    NzIconModule,
    NzSpinModule,
    NzEmptyModule,
    NzModalModule,
    NzMessageModule,
    NzDividerModule,
    NzListModule,
    NzInputModule,
    NzSelectModule,
    NetworkProtocolTagModule,
    NetworkTypeTagModule,
    PipeModule
  ]
})
export class ConnectionModule {}
