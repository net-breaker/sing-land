import { Component, OnInit } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd/message";
import { NzModalService } from "ng-zorro-antd/modal";
import { Subscription } from "rxjs";
import { ClashService } from "src/app/core/service/clash.service";
import { Connection, ConnectionService } from "src/app/core/service/monitor-connection.service";

type SortType = "IP_OR_DOMAIN" | "DATETIME" | "UPLOAD_TRAFFIC" | "DOWNLOAD_TRAFFIC" | "TOTAL_TRAFFIC";
type SortOrder = "ASC" | "DESC";

@Component({
  selector: "app-connection",
  templateUrl: "./connection.component.html",
  styleUrls: ["./connection.component.scss"]
})
export class ConnectionComponent implements OnInit {
  uploadTotal: number = 0;
  downloadTotal: number = 0;

  private allConnections: Connection[] = [];
  connections: Connection[] = [];

  loadding: boolean = true;
  searhText: string = "";

  private connectionsSubscription: Subscription | undefined;

  // sort
  sortKey: SortType = "IP_OR_DOMAIN";
  sortOrder: SortOrder = "ASC";

  constructor(private clashService: ClashService, private connectionService: ConnectionService, private message: NzMessageService, private modal: NzModalService) {}

  async ngOnInit(): Promise<void> {
    if (await this.clashService.isRunningOrConnected()) {
      this.connectionsSubscription = this.connectionService.connections$.subscribe((connections) => {
        this.uploadTotal = connections.uploadTotal;
        this.downloadTotal = connections.downloadTotal;
        this.allConnections = connections.connections;
        this.filterAndSortConnections();
        this.loadding = false;
      });
    } else {
      this.loadding = false;
    }
  }

  filterAndSortConnections() {
    // filter
    let result = this.allConnections.filter((connection) => {
      if (this.searhText.trim() === "") return true;
      const target = (connection.metadata.host ? connection.metadata.host : connection.metadata.destinationIP) + ":" + connection.metadata.destinationPort;
      const fullText =
        target +
        "|" +
        connection.chains.join("|") +
        "|" +
        connection.rule +
        "(" +
        connection.rulePayload +
        ")" +
        "|" +
        connection.metadata.sourceIP +
        ":" +
        connection.metadata.sourcePort;
      return fullText.toLowerCase().includes(this.searhText.toLowerCase());
    });
    // sort
    switch (this.sortKey) {
      case "IP_OR_DOMAIN":
        result = result.sort((first, second) => {
          if (this.sortOrder === "ASC") return +(first.displayName > second.displayName) || -(first.displayName < second.displayName);
          else return +(first.displayName < second.displayName) || -(first.displayName > second.displayName);
        });
        break;
      case "DATETIME":
        if (this.sortOrder === "ASC") result = result.sort((first, second) => second.start - first.start);
        else result = result.sort((first, second) => first.start - second.start);
        break;
      case "UPLOAD_TRAFFIC":
        if (this.sortOrder === "ASC") result = result.sort((first, second) => first.upload - second.upload);
        else result = result.sort((first, second) => second.upload - first.upload);
        break;
      case "DOWNLOAD_TRAFFIC":
        if (this.sortOrder === "ASC") result = result.sort((first, second) => first.download - second.download);
        else result = result.sort((first, second) => second.download - first.download);
        break;
      case "TOTAL_TRAFFIC":
        if (this.sortOrder === "ASC") result = result.sort((first, second) => first.upload + first.download - second.upload - second.download);
        else result = result.sort((first, second) => second.upload + second.download - first.upload - first.download);
        break;
    }
    // set result to connections
    this.connections = result;
  }

  closeConnection(connectionId: string) {
    const connection = this.allConnections.find((connection) => connection.id === connectionId);
    this.modal.confirm({
      nzTitle: "Disconnect this connection",
      nzContent: `Are you sure disconnect this connection?<br/>${connection!.displayName}`,
      nzOkText: "Yes",
      nzOkType: "primary",
      nzOkDanger: true,
      nzMaskClosable: true,
      nzCancelText: "No",
      nzOnOk: () =>
        this.connectionService.closeConnection(connectionId).subscribe(
          () => {
            this.message.create("success", "Disconnected", { nzDuration: 900 });
          },
          (error) => {
            this.message.create("error", "Unknown error", { nzDuration: 900 });
          }
        )
    });
  }

  closeAllConnections() {
    this.modal.confirm({
      nzTitle: "Disconnect all connection",
      nzContent: "Are you sure disconnect all connection?",
      nzOkText: "Yes, I'm sure",
      nzOkType: "primary",
      nzOkDanger: true,
      nzMaskClosable: true,
      nzCancelText: "No",
      nzOnOk: () =>
        this.connectionService.closeAllConnections().subscribe(
          () => {
            this.message.create("success", "Disconnected all connection", { nzDuration: 900 });
          },
          (error) => {
            this.message.create("error", "Unknown error", { nzDuration: 900 });
          }
        )
    });
  }

  ngOnDestroy(): void {
    this.connectionsSubscription?.unsubscribe();
  }

  trackById(index: number, item: any): number {
    return item.id;
  }
}
