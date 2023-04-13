import { Injectable } from "@angular/core";
import { BehaviorSubject, filter } from "rxjs";
import { Log } from "../infrastructure/singbox.infrastructure";
import { SettingManager } from "../manager/setting.manager";
import { SingboxManager } from "../manager/singbox.manager";

@Injectable({
  providedIn: "root"
})
export class LogMonitorService {
  private cacheLogCount = 500;
  private logs: Log[] = [];

  private logsBehaviorSubject = new BehaviorSubject<Log[]>([]);
  logs$ = this.logsBehaviorSubject.asObservable();

  constructor(private singboxManager: SingboxManager, private settingManager: SettingManager) {
    this.cacheLogCount = this.settingManager.get("logCacheCount", 500)!;
    this.monitorLogs();
  }

  private monitorLogs() {
    this.singboxManager.localSingboxLogs$.pipe(filter((log) => log !== null)).subscribe((log) => {
      this.logs.unshift(log!);
      if (this.logs.length > this.cacheLogCount) this.logs.pop();
      console.log(this.logs.length);
      this.logsBehaviorSubject.next(this.logs);
    });
  }

  clearLogs() {
    this.logs = [];
    this.logsBehaviorSubject.next(this.logs);
  }
}
