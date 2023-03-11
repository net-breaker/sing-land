export abstract class SettingInfrastructure {
  abstract getClashInstalledVersion(): string | undefined;
  abstract setClashInstalledVersion(version: string): void;

  abstract get<T>(key: string, defaultValue?: T): T | undefined;
  abstract set<T>(key: string, v: T | undefined): void;
  abstract delete(key: string): void;
  abstract has(key: string): boolean;
}
