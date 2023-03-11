import { SettingInfrastructure } from "../infrastructure/setting.infrastructure";

export class SettingManager {
  constructor(private settingInfrastructure: SettingInfrastructure) {}

  get<T>(key: string, defaultValue?: T): T | undefined {
    return this.settingInfrastructure.get(key, defaultValue) as T | undefined;
  }

  set<T>(key: string, v: T | undefined): void {
    this.settingInfrastructure.set(key, v);
  }

  delete(key: string): void {
    this.settingInfrastructure.delete(key);
  }

  has(key: string): boolean {
    return this.settingInfrastructure.has(key);
  }
}
