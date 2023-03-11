import { Component, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { ClashService } from "src/app/core/service/clash.service";
import { Rule, RuleService } from "src/app/core/service/rule.service";

@Component({
  selector: "app-rule",
  templateUrl: "./rule.component.html",
  styleUrls: ["./rule.component.scss"]
})
export class RuleComponent implements OnInit {
  private allRules: Rule[] = [];
  rules: Rule[] = [];

  loadding: boolean = true;
  subscription: Subscription | undefined;
  searhText: string = "";

  constructor(private clashService: ClashService, private ruleService: RuleService) {}

  async ngOnInit(): Promise<void> {
    if (await this.clashService.isRunningOrConnected()) {
      this.subscription = this.ruleService.getRules().subscribe((rules) => {
        this.allRules = rules;
        this.rules = rules;
        this.loadding = false;
      });
    } else {
      this.loadding = false;
    }
  }

  filterRules() {
    this.rules = this.allRules.filter((rule) => {
      if (this.searhText.trim() === "") return true;
      const fullText = rule.payload + rule.proxy + rule.type;
      return fullText.toLowerCase().includes(this.searhText.toLowerCase());
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
