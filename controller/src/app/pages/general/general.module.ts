import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { NzDividerModule } from "ng-zorro-antd/divider";
import { NzSegmentedModule } from "ng-zorro-antd/segmented";
import { NzSwitchModule } from "ng-zorro-antd/switch";
import { NzTypographyModule } from "ng-zorro-antd/typography";
import { GeneralComponent } from "./general.component";

@NgModule({
  declarations: [GeneralComponent],
  imports: [BrowserModule, CommonModule,FormsModule, NzDividerModule, NzTypographyModule, NzSwitchModule, NzSegmentedModule]
})
export class GeneralModule {}
