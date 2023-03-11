export abstract class ConfigInfrastructure {
  abstract version: string;
  abstract logLevel: string;

  abstract loggerDirectory: string;
  abstract singboxDirectory: string;
  abstract profilesDirectory: string;
  abstract settingDirectory: string;

  /**
   * singbox version in package
   *
   * for install singbox
   */
  abstract singboxVersionInPackage: string;

  abstract get<T>(key: string, defaultValue?: T): T;
  abstract has(key: string): boolean;
}
