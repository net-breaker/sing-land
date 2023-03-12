import { Component, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { Log } from "src/app/core/infrastructure/singbox.infrastructure";
import { LogMonitorService } from "src/app/core/service/monitor-log.service";

@Component({
  selector: "app-logs",
  templateUrl: "./logs.component.html",
  styleUrls: ["./logs.component.scss"]
})
export class LogsComponent implements OnInit {
  level = "INFO";
  private logsSubscription: Subscription | undefined;

  private allLogs: Log[] = [];
  logs: Log[] = [];

  constructor(private logMonitorService: LogMonitorService) {}

  ngOnInit(): void {
    this.logsSubscription = this.logMonitorService.logs$.subscribe((logs) => {
      this.allLogs = logs;
      this.filterLogs();
    });
  }

  filterLogs() {
    this.logs = this.allLogs.filter((log) => {
      if (this.level === "ALL") return true;
      return log.level == this.level;
    });
    console.log(this.logs);
  }

  clear() {
    this.logMonitorService.clearLogs();
  }

  ngOnDestroy(): void {
    this.logsSubscription?.unsubscribe();
  }
}
