import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-network-protocol-tag",
  templateUrl: "./network-protocol-tag.component.html",
  styleUrls: ["./network-protocol-tag.component.scss"]
})
export class NetworkProtocolTagComponent implements OnInit {
  @Input() protocol: string = "TCP";

  constructor() {}

  ngOnInit(): void {}
}
