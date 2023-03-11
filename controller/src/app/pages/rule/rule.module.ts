import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { NzEmptyModule } from "ng-zorro-antd/empty";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzListModule } from "ng-zorro-antd/list";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { RuleComponent } from "./rule.component";

@NgModule({
  declarations: [RuleComponent],
  imports: [BrowserModule, FormsModule, NzSpinModule, NzEmptyModule, NzListModule, NzInputModule]
})
export class RuleModule {}
