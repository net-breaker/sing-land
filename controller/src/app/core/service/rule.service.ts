import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import { ClashManager } from "../manager/clash.manager";

export interface Rule {
  payload: string;
  proxy: string;
  type: string;
}

@Injectable({
  providedIn: "root"
})
export class RuleService {
  constructor(private httpClient: HttpClient, private clashManager: ClashManager) { }

  getRules(): Observable<Rule[]> {
    return this.httpClient.get(`${this.clashManager.baseUrl}/rules`, { headers: this.clashManager.authorizationHeaders }).pipe(map((response: any) => response.rules as Rule[]));
  }
}
