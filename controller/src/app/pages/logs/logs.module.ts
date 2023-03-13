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
    PipeModule
  ]
})
export class LogsModule {}
