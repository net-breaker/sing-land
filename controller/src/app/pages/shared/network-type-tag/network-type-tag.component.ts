import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-network-type-tag",
  templateUrl: "./network-type-tag.component.html",
  styleUrls: ["./network-type-tag.component.scss"]
})
export class NetworkTypeTagComponent implements OnInit {
  @Input() type: string = "HTTP";

  constructor() {}

  ngOnInit(): void {}
}
