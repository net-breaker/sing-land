import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, timer } from "rxjs";
import { ClashManager } from "../manager/clash.manager";

export interface Log {
  level: LogLevel;
  protocol: string;
  time: number;
}

export interface TCPOrUDPInfoLog extends Log {
  from: string;
  to: string;
  matched: string;
  node: string;
}

export interface TUNLog extends Log {
  description: string;
}

export interface DNSLog extends Log {
  source: string;
  target: string;
}

export type LogLevel = "info" | "warn" | "error" | "debug";

@Injectable({
  providedIn: "root"
})
export class LogMonitorService {
  private logsBehaviorSubject = new BehaviorSubject<Log[]>([]);
  private logs$ = this.logsBehaviorSubject.asObservable();

  private logInfoTCPOrUDPContentRegex = /\[(.*)\]\s(\S*)\s\-\-\>\s(\S*)\smatch\s(.*)\susing\s(.*)/;
  private logDebugDNSContentRegex = /\[(.*)\]\s(\S*)\s\-\-\>\s(\S*)/;
  private logDebugTUNContentRegex = /\[(TUN)\]\s(.*)/;

  requestController?: AbortController;
  private logsReader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  private logs: Log[] = [];

  constructor(private clashManager: ClashManager) {
    this.monitorLogs();
  }

  get logsObservable(): Observable<Log[]> {
    this.logsReader = undefined;
    this.requestController?.abort();
    this.initLogsReader();
    return this.logs$;
  }

  private initLogsReader() {
    this.requestController = new AbortController();
    fetch(
      `${this.clashManager.baseUrl}/logs?level=debug`,
      {
        headers: this.clashManager.authorizationHeaders,
        signal: this.requestController.signal
      }
    ).then((response) => {
      this.logsReader = response.body!.getReader();
      if (response.status < 200 || response.status >= 300) timer(5000).subscribe(() => this.initLogsReader());
    }).catch((error) => {
      // ignore
    });
  }

  private monitorLogs() {
    timer(0, 1000).subscribe(() => {
      if (this.logsReader === undefined) return;
      this.logsReader!
        .read()
        .then((result) => {
          const logsString = new TextDecoder().decode(result.value);
          if (logsString.indexOf("\n") > -1)
            logsString.split("\n").map((logString) => {
              if (logString.length > 0) this.recordLogFromString(logString);
            });
          else this.recordLogFromString(logsString);
          if (this.logs.length > 300) this.logs.pop();
          this.logsBehaviorSubject.next(this.logs);
        })
        .catch((error) => {
          const isJsonUnexpected = this.jsonUnexpectedRegex.test(error.message);
          if (!isJsonUnexpected) console.log("[ignore]: ", error);
        });
    });
  }

  private recordLogFromString(logString: string) {
    const logObject = JSON.parse(logString);

    var matchResult: any = null;
    matchResult = logObject.payload.match(this.logInfoTCPOrUDPContentRegex);
    if (matchResult !== null) {
      const log: TCPOrUDPInfoLog = {
        level: logObject.type,
        protocol: matchResult[1].toLowerCase(),
        from: matchResult[2],
        to: matchResult[3],
        time: new Date().getTime(),
        matched: matchResult[4],
        node: matchResult[5]
      };
      this.logs.unshift(log);
      return;
    }
    matchResult = logObject.payload.match(this.logDebugDNSContentRegex);
    if (matchResult !== null) {
      const log: DNSLog = {
        level: logObject.type,
        protocol: matchResult[1].toLowerCase(),
        source: matchResult[2],
        target: matchResult[3],
        time: new Date().getTime()
      };
      this.logs.unshift(log);
      return;
    }

    matchResult = logObject.payload.match(this.logDebugTUNContentRegex);
    if (matchResult !== null) {
      const log: TUNLog = {
        level: logObject.type,
        protocol: matchResult[1].toLowerCase(),
        time: new Date().getTime(),
        description: matchResult[2]
      };
      this.logs.unshift(log);
      return;
    }

    console.log(logObject);

    //  {
    //     "type": "warning",
    //     "payload": "[TCP] dial DIRECT (match GeoIP/CN) to www.google.co.jp:443 error: dial tcp4 118.193.202.219:443: i/o timeout"
    // }
  }

  clearLogs() {
    this.logs = [];
    this.logsBehaviorSubject.next(this.logs);
  }

  /**
   * ingore log
   */
  private jsonUnexpectedRegex = /.*Unexpected.*JSON.*/;
}
