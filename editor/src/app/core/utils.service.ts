import { Injectable } from "@angular/core";
export type EventType = "RELOAD_FROM_DISK" | "SAVE_TO_DISK";

@Injectable({
  providedIn: "root"
})
export class UtilsService {
  filePath: string;

  constructor() {
    const pathIndex = window.process.argv.indexOf("--path") + 1;
    this.filePath = window.process.argv[pathIndex];
  }
}
