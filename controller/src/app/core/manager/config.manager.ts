import { ConfigInfrastructure } from "../infrastructure/config.infrastructure";

export class ConfigManager {
  constructor(private configInfrastructure: ConfigInfrastructure) {}

  version = this.configInfrastructure.version;
  profilesDirectory = this.configInfrastructure.profilesDirectory;

  get<T>(key: string, defaultValue?: T): T | undefined {
    return this.configInfrastructure.get(key, defaultValue) as T | undefined;
  }

  has(key: string): boolean {
    return this.configInfrastructure.has(key);
  }
}
