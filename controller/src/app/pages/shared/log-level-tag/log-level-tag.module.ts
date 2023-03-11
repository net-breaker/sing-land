import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NzTagModule } from "ng-zorro-antd/tag";
import { LogLevelTagComponent } from "./log-level-tag.component";

@NgModule({
  declarations: [LogLevelTagComponent],
  imports: [CommonModule, NzTagModule],
  exports: [LogLevelTagComponent]
})
export class LogLevelTagModule {}
