import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzInputNumberModule } from "ng-zorro-antd/input-number";
import { NzModalModule } from "ng-zorro-antd/modal";
import { NzPopoverModule } from "ng-zorro-antd/popover";
import { NzSelectModule } from "ng-zorro-antd/select";
import { ProfilesAddComponent } from "./profiles-add.component";

@NgModule({
  declarations: [ProfilesAddComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzPopoverModule,
    NzSelectModule,
    NzFormModule,
    NzModalModule,
    NzInputModule,
    NzInputNumberModule,
    NzIconModule,
    NzButtonModule
  ],
  exports: [ProfilesAddComponent]
})
export class ProfilesAddModule {}
