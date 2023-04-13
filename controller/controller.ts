import { BrowserWindow, BrowserWindowConstructorOptions, app } from "electron";
import * as fs from "fs";
import * as os from "os";

export class Controller {
  private platform = os.platform();
  private window?: BrowserWindow;
  private windowConfig: BrowserWindowConstructorOptions = {
    width: 850,
    height: 600,
    minWidth: 850,
    minHeight: 600,
    // mac title menu
    titleBarStyle: "hiddenInset",
    transparent: this.platform === "darwin" ? true : false,
    autoHideMenuBar: this.platform === "darwin" ? false : true,
    frame: true,
    vibrancy: "sidebar",
    visualEffectState: "followWindow",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      spellcheck: false
    }
  };

  private isQuiting: boolean = false;

  constructor() {
    this.setEnvironment();
  }

  startup() {
    if (this.window) {
      this.window.show();
      return;
    }

    this.window = new BrowserWindow(this.windowConfig);
    if (process.argv.indexOf("--port") > -1) {
      const portIndex = process.argv.indexOf("--port") + 1;
      const port = process.argv[portIndex];
      this.window.webContents.openDevTools({ mode: "bottom" });
      process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
      this.window.loadURL(`http://localhost:${port}`);
    } else {
      this.window.loadFile("./controller/index.html");
    }

    this.window.on("close", (event) => {
      if (!this.isQuiting) {
        event.preventDefault();
        this.window!.hide();
      }
      return false;
    });
  }

  private setEnvironment() {
    let NODE_CONFIG_DIR = `${process.resourcesPath}/config`;

    // development
    const exsitOnWorkspace = fs.existsSync("./resources/config");
    if (exsitOnWorkspace) NODE_CONFIG_DIR = "./resources/config";

    process.env["NODE_CONFIG_DIR"] = NODE_CONFIG_DIR;
    console.log(`export NODE_CONFIG_DIR=${NODE_CONFIG_DIR}`);
  }

  hide() {
    if (this.window) this.window.hide();
  }

  show() {
    if (this.window) this.window.show();
  }

  quit() {
    this.isQuiting = true;
    app.quit();
  }
}
