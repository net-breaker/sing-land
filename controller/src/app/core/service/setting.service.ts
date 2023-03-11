import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { SingboxManager } from "../manager/singbox.manager";

@Injectable({
  providedIn: "root"
})
export class SettingService {
  constructor(private httpClient: HttpClient, private singboxManager: SingboxManager) {}

  private ping(): Observable<any> {
    return this.httpClient.get(this.singboxManager.baseUrl, { headers: this.singboxManager.authorizationHeaders }) as Observable<any>;
  }

  getVersion(): Observable<string> {
    return this.httpClient.get(`${this.singboxManager.baseUrl}/version`, { headers: this.singboxManager.authorizationHeaders }) as unknown as Observable<string>;
  }
}
  