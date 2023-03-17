import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
} from "electron";

const contextMenu = require("electron-context-menu");
const fs = require("fs");

export class Application {
  controllerWindow;
  editorWindows = new Map<string, Electron.BrowserWindow>();

  isAlwaysOnTop = false;

  constructor() {
    this.setEnvironment();

    app.whenReady().then(() => {
      this.createOrShowControllerWindow();
    });

    ipcMain.handle("window", async (event, module, action, path) => {
      const window = this.moduleToWindow(module);
      this.operate(window, action, path);
    });
  }

  private createOrShowControllerWindow() {
    if (this.controllerWindow) {
      this.controllerWindow.show();
      return;
    }

    let config: BrowserWindowConstructorOptions = {
      width: 850,
      height: 600,
      minWidth: 850,
      minHeight: 600,
      // mac title menu
      titleBarStyle: "hiddenInset",
      transparent: true,
      autoHideMenuBar: false,
      frame: false,
      vibrancy: "sidebar",
      visualEffectState: "followWindow",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
        spellcheck: false,
      },
    };
    this.controllerWindow = new BrowserWindow(config);
    this.controllerWindow.loadFile("./controller/index.html");
    this.setContextMenu();
  }

  /**
   * create or show editor window
   * @param filePath open file path
   */
  private createOrShowEditorWindow(filePath: string) {
    const exists = this.editorWindows[filePath] !== undefined;
    if (exists) {
      this.editorWindows[filePath].show();
      return;
    }

    let config: BrowserWindowConstructorOptions = {
      width: 850,
      height: 600,
      minWidth: 850,
      minHeight: 600,
      titleBarStyle: "hiddenInset",
      autoHideMenuBar: false,
      frame: false,
      vibrancy: "sidebar",
      visualEffectState: "followWindow",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
        additionalArguments: [`--path=${filePath}`],
      },
    };
    const window = new BrowserWindow(config);
    window.loadFile("./editor/index.html");
    this.editorWindows[filePath] = window;
    window.on("closed", () => {
      this.editorWindows[filePath] = undefined;
    });
  }

  private operate(
    window: Electron.BrowserWindow,
    action: string,
    path?: string
  ) {
    switch (action) {
      case "minimize":
        window.minimize();
        window.webContents.send("window", "minimize");
        break;
      case "maximize":
        window.maximize();
        window.webContents.send("window", "maximize");
        break;
      case "unmaximize":
        window.unmaximize();
        window.webContents.send("window", "unmaximize");
        break;
      case "affix":
        this.isAlwaysOnTop = !this.isAlwaysOnTop;
        window.setAlwaysOnTop(this.isAlwaysOnTop);
        const position = this.isAlwaysOnTop ? "affixed" : "unaffix";
        window.webContents.send("window", position);
        break;
      case "close":
        window.close();
        break;
      case "coder":
        this.createOrShowEditorWindow(path!);
        break;
    }
  }

  private setContextMenu() {
    const getProfileName = (title: string): string => {
      return title.substring(0, title.indexOf("\n"));
    };
    const contextMenuConfig = {
      showInspectElement: false,
      showSelectAll: false,
      showCopyImage: false,
      showSaveImageAs: false,
      showLearnSpelling: false,
      showLookUpSelection: false,
      showSearchWithGoogle: false,
      menu: (actions, params, browserWindow) => [],
      prepend: (defaultActions, parameters, browserWindow, event) => [
        {
          label: "edit",
          visible:
            parameters.titleText.endsWith("file") ||
            parameters.titleText.endsWith("connection"),
          click: () => {
            let name = getProfileName(parameters.titleText);
            this.controllerWindow.webContents.send("profiles", "edit", name);
          },
        },
        {
          label: "coder",
          visible:
            parameters.titleText.endsWith("local file") ||
            parameters.titleText.endsWith("remote file"),
          click: () => {
            let name = getProfileName(parameters.titleText);
            this.controllerWindow.webContents.send("profiles", "coder", name);
          },
        },
        {
          label: "sync",
          visible: parameters.titleText.endsWith("remote file"),
          click: () => {
            let name = getProfileName(parameters.titleText);
            this.controllerWindow.webContents.send("profiles", "sync", name);
          },
        },
        {
          label: "delete",
          visible:
            parameters.titleText.endsWith("file") ||
            parameters.titleText.endsWith("connection"),
          click: () => {
            let name = getProfileName(parameters.titleText);
            this.controllerWindow.webContents.send("profiles", "delete", name);
          },
        },
      ],
    };
    contextMenu(contextMenuConfig);
  }

  private moduleToWindow(module: string) {
    let window;
    let path;
    if (module.indexOf(":") >= 0) {
      const splited = module.split(":");
      module = splited[0];
      path = splited[1];
    }

    switch (module) {
      case "controller":
        window = this.controllerWindow;
        break;
      case "editor":
        window = this.editorWindows[path];
        break;
    }
    return window;
  }

  private setEnvironment() {
    let NODE_CONFIG_DIR = `${process.resourcesPath}/config`;

    // development
    const exsitOnWorkspace = fs.existsSync("./resources/config");
    if (exsitOnWorkspace) NODE_CONFIG_DIR = "./resources/config";

    process.env["NODE_CONFIG_DIR"] = NODE_CONFIG_DIR;
    console.log(`export NODE_CONFIG_DIR=${NODE_CONFIG_DIR}`);
  }
}
