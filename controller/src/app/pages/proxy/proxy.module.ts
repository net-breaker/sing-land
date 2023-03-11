import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NzGridModule } from "ng-zorro-antd/grid";
import { NzIconModule } from "ng-zorro-antd/icon";
import { ProxyComponent } from "./proxy.component";

@NgModule({
  declarations: [ProxyComponent],
  imports: [CommonModule, NzGridModule, NzIconModule]
})
export class ProxyModule {}
