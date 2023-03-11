import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-log-level-tag",
  templateUrl: "./log-level-tag.component.html",
  styleUrls: ["./log-level-tag.component.scss"]
})
export class LogLevelTagComponent implements OnInit {
  @Input() level: string = "info";

  constructor() {}

  ngOnInit(): void {}
}
