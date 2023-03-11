import config from "config";
import fs from "fs";
import * as os from "os";
import * as path from "path";
import { ConfigInfrastructure } from "../config.infrastructure";

export class ConfigInfrastructureImpl implements ConfigInfrastructure {
  get version(): string {
    return this.get<string>("version", "unknown");
  }

  /**
   * clash version in package
   */
  get clashVersionInPackage(): string {
    return this.get<string>("clash-version", "unknown");
  }

  private get homeDirectory(): string {
    const homeDir = config.get<string>("home.directory");
    return path.join(os.homedir(), homeDir);
  }

  get logLevel(): string {
    return config.get<string>("logger.level");
  }

  get loggerDirectory(): string {
    const loggerDir = config.get<string>("logger.directory");
    const absolutePath = path.join(this.homeDirectory, loggerDir);
    if (!fs.existsSync(absolutePath)) fs.mkdirSync(absolutePath, { recursive: true });
    return absolutePath;
  }

  get clashDirectory(): string {
    const clashDir = config.get<string>("home.clash.directory");
    const absolutePath = path.join(this.homeDirectory, clashDir);
    if (!fs.existsSync(absolutePath)) fs.mkdirSync(absolutePath, { recursive: true });
    return absolutePath;
  }

  get profilesDirectory(): string {
    const clashDir = config.get<string>("home.data.profiles.directory");
    const absolutePath = path.join(this.homeDirectory, clashDir);
    if (!fs.existsSync(absolutePath)) fs.mkdirSync(absolutePath, { recursive: true });
    return absolutePath;
  }

  get settingDirectory(): string {
    const settingDir = config.get<string>("home.setting.directory");
    const absolutePath = path.join(this.homeDirectory, settingDir);
    if (!fs.existsSync(absolutePath)) fs.mkdirSync(absolutePath, { recursive: true });
    return absolutePath;
  }

  get databasePath(): string {
    const dbPath = config.get<string>("home.data.database.path");
    return path.join(this.homeDirectory, dbPath);
  }

  get<T>(key: string, defaultValue?: T): T {
    if (config.has(key)) {
      return config.get<T>(key);
    } else if (defaultValue !== undefined) {
      return defaultValue;
    } else {
      throw new Error(`unknown config option: ${key}`);
    }
  }

  has(key: string): boolean {
    return config.has(key);
  }
}
