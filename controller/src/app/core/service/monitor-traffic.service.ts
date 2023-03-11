import { Injectable } from "@angular/core";
import { BehaviorSubject, interval, merge, timer } from "rxjs";
import { ClashManager } from "../manager/clash.manager";

export interface Traffic {
  up: number;
  down: number;
}

@Injectable({
  providedIn: "root"
})
export class TrafficMonitorService {
  private trafficBehaviorSubject = new BehaviorSubject<Traffic>({ up: 0, down: 0 });
  traffic$ = this.trafficBehaviorSubject.asObservable();

  requestController?: AbortController;
  private trafficReader: ReadableStreamDefaultReader<Uint8Array> | undefined;

  constructor(private clashManager: ClashManager) {
    this.monitorTraffic();
    merge(this.clashManager.localClashStatusChanged$, this.clashManager.remoteClashStatusChanged$).subscribe({
      next: (status) => {
        switch (status) {
          case "connected":
          case "running":
            this.trafficReader = undefined;
            this.requestController?.abort();
            this.initTrafficReader();
            break;
          default:
            break;
        }
      }
    });
  }

  private initTrafficReader() {
    this.requestController = new AbortController();
    fetch(`${this.clashManager.baseUrl}/traffic`, {
      headers: this.clashManager.authorizationHeaders,
      signal: this.requestController.signal
    })
      .then((response) => {
        this.trafficReader = response.body!.getReader();
        if (response.status < 200 || response.status >= 300) timer(5000).subscribe(() => this.initTrafficReader());
      })
      .catch((error) => {
        // ignore
      });
  }

  private monitorTraffic() {
    interval(1000).subscribe(() => {
      if (this.trafficReader === undefined) return;
      this.trafficReader!.read()
        .then((result) => {
          const trafficString = new TextDecoder().decode(result.value);
          const traffic = JSON.parse(trafficString);
          this.trafficBehaviorSubject.next(traffic);
        })
        .catch((error) => {
          const isJsonUnexpected = this.jsonUnexpectedRegex.test(error.message);
          if (!isJsonUnexpected) console.log("[ignore]: ", error);
        });
    });
  }

  /**
   * ingore log
   */
  private jsonUnexpectedRegex = /.*Unexpected.*JSON.*/;
}
