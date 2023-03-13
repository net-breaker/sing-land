const { app, BrowserWindow, ipcMain } = require("electron");
const contextMenu = require("electron-context-menu");

process.env["NODE_CONFIG_DIR"] = "./resources/config";

let controllerWindow;
let editorWindow;

let isAlwaysOnTop = false;

let browserWindowConfig = {
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
    spellcheck: false
  }
};

let contextMenuConfig = {
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
      visible: stringEndWith(parameters.titleText, "file") || stringEndWith(parameters.titleText, "connection"),
      click: () => {
        let name = parameters.titleText.substring(0, parameters.titleText.indexOf("\n"));
        controllerWindow.webContents.send("profiles", "edit", name);
      }
    },
    {
      label: "coder",
      visible: stringEndWith(parameters.titleText, "local file") || stringEndWith(parameters.titleText, "remote file"),
      click: () => {
        let name = parameters.titleText.substring(0, parameters.titleText.indexOf("\n"));
        controllerWindow.webContents.send("profiles", "coder", name);
      }
    },
    {
      label: "sync",
      visible: stringEndWith(parameters.titleText, "remote file"),
      click: () => {
        let name = parameters.titleText.substring(0, parameters.titleText.indexOf("\n"));
        controllerWindow.webContents.send("profiles", "sync", name);
      }
    },
    {
      label: "delete",
      visible: stringEndWith(parameters.titleText, "file") || stringEndWith(parameters.titleText, "connection"),
      click: () => {
        let name = parameters.titleText.substring(0, parameters.titleText.indexOf("\n"));
        controllerWindow.webContents.send("profiles", "delete", name);
      }
    }
  ]
};

function createWindow() {
  contextMenu(contextMenuConfig);
  controllerWindow = new BrowserWindow(browserWindowConfig);
  controllerWindow.loadFile("./controller/index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });

  ipcMain.handle("window", async (event, module, action, path) => {
    let window;
    switch (module) {
      case "controller":
        window = controllerWindow;
        break;
      case "editor":
        window = editorWindow;
        break;
    }

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
        isAlwaysOnTop = !isAlwaysOnTop;
        window.setAlwaysOnTop(isAlwaysOnTop);
        window.webContents.send("window", isAlwaysOnTop ? "affixed" : "unaffix");
        break;
      case "close":
        window.close();
        break;
      case "coder":
        let config = {
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
            additionalArguments: [`--path=${path}`]
          }
        }
        editorWindow = new BrowserWindow(config);
        editorWindow.loadFile("./editor/index.html");
        break;
    }
  });
});

function stringEndWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
