import { Injectable } from "@angular/core";
import { SettingManager } from "../manager/setting.manager";

@Injectable({
  providedIn: "root"
})
export class SettingService {
  constructor(private settingManager: SettingManager) {}

  get<T>(key: string, defaultValue?: T): T | undefined {
    return this.settingManager.get(key, defaultValue);
  }

  set<T>(key: string, v: T | undefined): void {
    this.settingManager.set(key, v);
  }

  delete(key: string): void {
    this.settingManager.delete(key);
  }

  has(key: string): boolean {
    return this.settingManager.has(key);
  }
}
