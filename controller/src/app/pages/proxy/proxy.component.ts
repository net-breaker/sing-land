import { Component, OnInit } from "@angular/core";
import { ClashService } from "src/app/core/service/clash.service";
import { Provider, ProvidersService } from "src/app/core/service/providers.service";
import { ProxyService } from "src/app/core/service/proxy.service";

@Component({
  selector: "app-proxy",
  templateUrl: "./proxy.component.html",
  styleUrls: ["./proxy.component.scss"]
})
export class ProxyComponent implements OnInit {
  providers: Provider[] = [];
  provider: Provider = {
    name: "string",
    proxies: [],
    type: "string",
    vehicleType: "string"
  };

  constructor(private clashService: ClashService, private proxyService: ProxyService, private providersService: ProvidersService) {}

  async ngOnInit(): Promise<void> {
    if (await this.clashService.isRunningOrConnected()) {
      this.providersService.getProviders().subscribe((providers) => {
        this.providers = providers;
        this.provider = providers[0];
      });

      // this.proxyService.getProxyGroups().subscribe(proxyGroups => {
      //   console.log(proxyGroups)
      // })
    }
  }
}
