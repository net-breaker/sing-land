import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, repeat } from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import { ClashManager } from "../manager/clash.manager";
import { Traffic } from "./monitor-traffic.service";

export interface Metadata {
  destinationIP: string;
  destinationPort: string;
  dnsMode: string;
  host: string;
  network: string;
  processPath: string;
  sourceIP: string;
  sourcePort: string;
  type: string;
}

export interface Connection {
  id: string;
  displayName: string;
  chains: string[];
  upload: number;
  download: number;
  uploadTotal: number;
  downloadTotal: number;
  metadata: Metadata;
  rule: string;
  rulePayload: string;
  start: number;
}

export interface Connectmation {
  connections: Connection[];
  downloadTotal: number;
  uploadTotal: number;
}

@Injectable({
  providedIn: "root"
})
export class ConnectionService {
  private histories = new Map<string, Traffic>();

  constructor(private clashManager: ClashManager, private httpClient: HttpClient) {}

  get connections$(): Observable<Connectmation> {
    return this.getConnections().pipe(repeat({ delay: 1000 }));
  }

  private getConnections(): Observable<Connectmation> {
    return this.httpClient.get(`${this.clashManager.baseUrl}/connections`, { headers: this.clashManager.authorizationHeaders }).pipe(
      map((data: any) => {
        const connections = data.connections.map((connection: Connection) => {
          const traffic = this.calculateTraffic(connection);
          const displayName = (connection.metadata.host ? connection.metadata.host : connection.metadata.destinationIP) + ":" + connection.metadata.destinationPort;
          return {
            id: connection.id,
            displayName,
            chains: connection.chains.reverse(),
            upload: traffic.up,
            download: traffic.down,
            uploadTotal: connection.upload,
            downloadTotal: connection.download,
            metadata: connection.metadata,
            rule: connection.rule,
            rulePayload: connection.rulePayload,
            start: new Date(connection.start).getTime()
          };
        });
        return {
          connections,
          downloadTotal: data.downloadTotal,
          uploadTotal: data.uploadTotal
        };
      })
    ) as unknown as Observable<Connectmation>;
  }

  closeAllConnections(): Observable<void> {
    return this.httpClient.delete(`${this.clashManager.baseUrl}/connections`, this.clashManager.authorizationHeaders) as unknown as Observable<void>;
  }

  closeConnection(connectionId: string): Observable<void> {
    return this.httpClient.delete(`${this.clashManager.baseUrl}/connections/${connectionId}`, this.clashManager.authorizationHeaders) as unknown as Observable<void>;
  }

  private calculateTraffic(connection: Connection): Traffic {
    let total = this.histories.get(connection.id);
    let traffic: Traffic;
    if (total) {
      traffic = {
        up: connection.upload - total.up,
        down: connection.download - total.down
      };
    } else {
      traffic = {
        up: connection.upload,
        down: connection.download
      };
    }
    total = {
      up: connection.upload,
      down: connection.download
    };
    this.histories.set(connection.id, total);
    return traffic;
  }
}
