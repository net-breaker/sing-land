import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { ClashManager } from "../manager/clash.manager";

export interface Provider {
  name: string;
  proxies: Proxy[];
  type: string;
  vehicleType: string;
}

export interface Proxy {
  history: any[];
  name: string;
  type: string;
  udp: boolean;
}

@Injectable({
  providedIn: "root"
})
export class ProvidersService {
  constructor(private httpClient: HttpClient, private clashManager: ClashManager) { }

  getProviders(): Observable<Provider[]> {
    return this.httpClient.get(`${this.clashManager.baseUrl}/providers/proxies`, { headers: this.clashManager.authorizationHeaders }).pipe(
      map((obj) => {
        const object = obj as any;
        const providers = object.providers as any;
        delete providers.default;
        return providers;
      }),
      map((providers) => {
        const result: Provider[] = [];
        Object.entries(providers).forEach((provider) => {
          result.push(provider[1] as Provider);
        });
        return result;
      })
    );
  }

  getProviderInformation(provider: string): Observable<Provider> {
    return this.httpClient.get<Provider>(`${this.clashManager.baseUrl}/providers/proxies/${provider}`, { headers: this.clashManager.authorizationHeaders }) as unknown as Observable<Provider>;
  }

  selectProvider(provider: string) {
    const body = {};
    return this.httpClient.put(`${this.clashManager.baseUrl}/providers/proxies/${provider}`, body);
  }

  checkProviderHealth(provider: string): Observable<Provider> {
    return this.httpClient.get<Provider>(`${this.clashManager.baseUrl}/providers/proxies/${provider}/healthcheck`);
  }
}
