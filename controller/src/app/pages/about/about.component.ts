import { Component, OnInit } from "@angular/core";
import { shell } from "electron";

@Component({
  selector: "app-about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.scss"]
})
export class AboutComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  openExternalLink(url: string) {
    shell.openExternal(url);
  }
}
