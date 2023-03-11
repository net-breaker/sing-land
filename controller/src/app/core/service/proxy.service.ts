import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { concatMap, filter, map, of } from "rxjs";
import { ClashManager } from "../manager/clash.manager";

@Injectable({
  providedIn: "root"
})
export class ProxyService {
  constructor(private httpClient: HttpClient, private clashManager: ClashManager) { }

  private getProxies() {
    return this.httpClient.get(`${this.clashManager.baseUrl}/proxies`, { headers: this.clashManager.authorizationHeaders }).pipe(
      map((obj) => {
        const object = obj as any;
        return Object.entries(object.proxies);
      }),
      concatMap((proxies) => of(...proxies)),
      map((proxiy) => proxiy[1])
    );
  }

  getProxyGroups() {
    return this.getProxies().pipe(
      filter((proxiy) => {
        const x = proxiy as any;
        return x.all !== undefined;
      }),
      map((proxiy) => {
        // console.log(proxiy);
        return proxiy;
      })
    );
  }
}
