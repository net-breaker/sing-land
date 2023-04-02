import { BrowserWindow, BrowserWindowConstructorOptions, Menu, MenuItem } from "electron";
import * as os from "os";

export class Editor {
  private platform = os.platform();
  private window?: BrowserWindow;
  private windowConfig: BrowserWindowConstructorOptions = {
    width: 850,
    height: 600,
    minWidth: 850,
    minHeight: 600,
    titleBarStyle: "hiddenInset",
    autoHideMenuBar: this.platform === "darwin" ? false : true,
    vibrancy: "sidebar",
    visualEffectState: "followWindow",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      additionalArguments: [`--path=${this.filePath}`]
    }
  };

  constructor(public filePath: string) {}

  startup() {
    if (this.window) {
      this.window.show();
      return;
    }
    let menu: Electron.Menu = new Menu();
    menu.append(
      new MenuItem({
        label: "File",
        submenu: [
          {
            label: "Save",
            click: () => {
              this.window!.webContents.send("file", "save");
            }
          },
          {
            label: "Reolod file from disk",
            click: () => {
              this.window!.webContents.send("file", "reload");
            }
          }
        ]
      })
    );
    menu.append(
      new MenuItem({
        label: "View",
        submenu: [
          {
            label: "Toggle developer tools",
            click: () => {
              this.window!.webContents.toggleDevTools();
            }
          }
        ]
      })
    );

    this.window = new BrowserWindow(this.windowConfig);
    if (process.argv.indexOf("--port") > -1) {
      const portIndex = process.argv.indexOf("--port") + 1;
      const port = process.argv[portIndex];
      this.window.webContents.openDevTools({ mode: "bottom" });
      process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
      this.window.loadURL(`http://localhost:${port}`);
    } else {
      this.window.loadFile("./editor/index.html");
    }
    this.window.setMenu(menu);
    this.window.on("closed", () => {
      this.window = undefined;
    });
  }
}
