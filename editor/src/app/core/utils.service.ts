import { Injectable } from "@angular/core";
export type EventType = "RELOAD_FROM_DISK" | "SAVE_TO_DISK";

@Injectable({
  providedIn: "root"
})
export class UtilsService {
  filePath: string = "";

  constructor() {
    window.process.argv.forEach((val, index) => {
      if (val.indexOf("--path") === 0) {
        // example: --path=/home/anonysoul/Documents/cliesh.yaml
        this.filePath = val.split("=")[1];
      }
    });
  }
}
