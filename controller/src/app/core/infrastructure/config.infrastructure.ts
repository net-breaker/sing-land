export abstract class ConfigInfrastructure {
  abstract version: string;
  abstract logLevel: string;

  abstract loggerDirectory: string;
  abstract clashDirectory: string;
  abstract profilesDirectory: string;
  abstract settingDirectory: string;

  /**
   * clash version in package
   *
   * for install clash
   */
  abstract clashVersionInPackage: string;

  abstract get<T>(key: string, defaultValue?: T): T;
  abstract has(key: string): boolean;
}
