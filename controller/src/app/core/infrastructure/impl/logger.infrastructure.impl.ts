import { ipcRenderer } from "electron";
import { configure, getLogger } from "log4js";
import * as path from "path";
import { ConfigInfrastructure } from "../config.infrastructure";
import { LoggerInfrastructure } from "../logger.infrastructure";

export class LoggerInfrastructureImpl implements LoggerInfrastructure {
  constructor(configInfrastructure: ConfigInfrastructure) {
    this.configureLogger(configInfrastructure.loggerDirectory, configInfrastructure.logLevel);
    this.monitorIpcLog();
  }

  monitorIpcLog() {
    const logger = getLogger("LoggerInfrastructure");
    ipcRenderer.on("logger", (event, message) => {
      logger.info(message);
    });
  }

  private configureLogger(directory: string, level: string): void {
    configure({
      appenders: {
        cheese: {
          type: "dateFile",
          filename: path.join(directory, `${level}.log`),
          encoding: "utf-8",
          layout: {
            type: "pattern",
            pattern: "[%d{yyyy-MM-dd hh:mm:ss}] [%p] <%c>: %m"
          },
          maxLogSize: 10485760,
          pattern: "yyyy-MM-dd",
          keepFileExt: true,
          alwaysIncludePattern: true,
          daysToKeep: 15
        },
        out: {
          type: "stdout",
          encoding: "utf-8",
          layout: {
            type: "pattern",
            pattern: "%[[%d{yyyy-MM-dd hh:mm:ss}] [%p] <%c>%]: %m"
          }
        },
        console: {
          type: "console"
        },
        filterConsole: {
          type: "logLevelFilter",
          appender: "console",
          level: "info"
        }
      },
      categories: {
        default: { appenders: ["cheese", "out", "filterConsole"], level }
      }
    });
  }
}
