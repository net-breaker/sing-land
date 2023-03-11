import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { ClashManager } from "../manager/clash.manager";

export interface Version {
  premium: boolean;
  version: string;
}

@Injectable({
  providedIn: "root"
})
export class SettingService {
  constructor(private httpClient: HttpClient, private clashManager: ClashManager) {
    // this.ping().subscribe((result) => {
    //   console.log(result.hello == "clash");
    // });
  }

  private ping(): Observable<any> {
    return this.httpClient.get(this.clashManager.baseUrl, { headers: this.clashManager.authorizationHeaders }) as Observable<any>;
  }

  getVersion(): Observable<Version> {
    return this.httpClient.get(`${this.clashManager.baseUrl}/version`, { headers: this.clashManager.authorizationHeaders }) as unknown as Observable<Version>;
  }
}
