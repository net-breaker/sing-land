import { Component, OnInit } from "@angular/core";
import { Subscription, timer } from "rxjs";
import { Log } from "src/app/core/infrastructure/singbox.infrastructure";
import { LogMonitorService } from "src/app/core/service/monitor-log.service";

@Component({
  selector: "app-logs",
  templateUrl: "./logs.component.html",
  styleUrls: ["./logs.component.scss"]
})
export class LogsComponent implements OnInit {
  level = "ALL";
  private logsSubscription: Subscription | undefined;
  private viewRefreshSubscription: Subscription | undefined;

  private allLogs: Log[] = [];
  private filteredLogs: Log[] = [];
  viewLogs: Log[] = [];

  constructor(private logMonitorService: LogMonitorService) {
    this.viewRefreshSubscription = timer(0, 300).subscribe(() => {
      this.viewLogs = this.filteredLogs;
    });
  }

  ngOnInit(): void {
    this.logsSubscription = this.logMonitorService.logs$.subscribe((logs) => {
      this.allLogs = logs;
      this.filterLogs();
    });
  }

  filterLogs() {
    this.filteredLogs = this.allLogs.filter((log) => {
      if (this.level === "ALL") return true;
      return log.level == this.level;
    });
  }

  clear() {
    this.logMonitorService.clearLogs();
  }

  ngOnDestroy(): void {
    this.logsSubscription?.unsubscribe();
    this.viewRefreshSubscription?.unsubscribe();
  }
}
