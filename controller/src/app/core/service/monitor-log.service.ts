import { Injectable } from "@angular/core";
import { BehaviorSubject, filter } from "rxjs";
import { Log } from "../infrastructure/singbox.infrastructure";
import { SingboxManager } from "../manager/singbox.manager";

@Injectable({
  providedIn: "root"
})
export class LogMonitorService {
  private logs: Log[] = [];

  private logsBehaviorSubject = new BehaviorSubject<Log[]>([]);
  logs$ = this.logsBehaviorSubject.asObservable();

  constructor(private singboxManager: SingboxManager) {
    this.monitorLogs();
  }

  private monitorLogs() {
    this.singboxManager.localSingboxLogs$.pipe(filter((log) => log !== null)).subscribe((log) => {
      this.logs.unshift(log!);
      this.logsBehaviorSubject.next(this.logs);
    });
  }

  clearLogs() {
    this.logs = [];
    this.logsBehaviorSubject.next(this.logs);
  }
}
