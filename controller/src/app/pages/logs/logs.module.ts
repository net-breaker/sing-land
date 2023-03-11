import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { NzEmptyModule } from "ng-zorro-antd/empty";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzListModule } from "ng-zorro-antd/list";
import { NzRadioModule } from "ng-zorro-antd/radio";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { NzTagModule } from "ng-zorro-antd/tag";
import { PipeModule } from "src/app/pipe/pipe.module";
import { LogLevelTagModule } from "../shared/log-level-tag/log-level-tag.module";
import { NetworkProtocolTagModule } from "../shared/network-protocol-tag/network-protocol-tag.module";
import { LogsComponent } from "./logs.component";

@NgModule({
  declarations: [LogsComponent],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    NzTagModule,
    NzIconModule,
    NzSpinModule,
    NzEmptyModule,
    NzListModule,
    NzRadioModule,
    LogLevelTagModule,
    NetworkProtocolTagModule,
    PipeModule
  ]
})
export class LogsModule {}
