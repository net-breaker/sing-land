import { Component, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { ClashService } from "src/app/core/service/clash.service";
import { LogMonitorService } from "src/app/core/service/monitor-log.service";

@Component({
  selector: "app-logs",
  templateUrl: "./logs.component.html",
  styleUrls: ["./logs.component.scss"]
})
export class LogsComponent implements OnInit {
  level = "info";
  private clashStatusSubscription: Subscription | undefined;

  private allLogs: any[] = [];
  logs: any[] = [];

  constructor(private clashService: ClashService, private logMonitorService: LogMonitorService) {}

  async ngOnInit(): Promise<void> {
    if (await this.clashService.isRunningOrConnected()) {
      this.logMonitorService.logsObservable.subscribe((logs) => {
        this.allLogs = logs;
        this.filterLogs();
      });
    }
  }

  filterLogs() {
    this.logs = this.allLogs.filter((log) => {
      if (this.level === "all") return true;
      return log.level == this.level;
    });
  }

  clear() {
    this.logMonitorService.clearLogs();
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  ngOnDestroy(): void {
    this.clashStatusSubscription?.unsubscribe();
  }
}
