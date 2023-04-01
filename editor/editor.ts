import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  Menu,
  MenuItem,
} from "electron";

export class Editor {
  private window?: BrowserWindow;
  private windowConfig: BrowserWindowConstructorOptions = {
    width: 850,
    height: 600,
    minWidth: 850,
    minHeight: 600,
    titleBarStyle: "hiddenInset",
    autoHideMenuBar: false,
    vibrancy: "sidebar",
    visualEffectState: "followWindow",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      additionalArguments: [`--path=${this.filePath}`],
    },
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
            },
          },
          {
            label: "Reolod file from disk",
            click: () => {
              this.window!.webContents.send("file", "reload");
            },
          },
        ],
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
            },
          },
        ],
      })
    );

    this.window = new BrowserWindow(this.windowConfig);
    this.window.loadFile("./editor/index.html");
    this.window.setMenu(menu);
    this.window.on("closed", () => {
      this.window = undefined;
    });
  }
}
