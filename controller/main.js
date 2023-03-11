const { app, BrowserWindow, ipcMain } = require("electron");
const contextMenu = require("electron-context-menu");

process.env["NODE_CONFIG_DIR"] = "./resources/config";

let appWindow;
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
        appWindow.webContents.send("profiles", "edit", name);
      }
    },
    {
      label: "coder",
      visible: stringEndWith(parameters.titleText, "local file") || stringEndWith(parameters.titleText, "remote file"),
      click: () => {
        let name = parameters.titleText.substring(0, parameters.titleText.indexOf("\n"));
        appWindow.webContents.send("profiles", "coder", name);
      }
    },
    {
      label: "sync",
      visible: stringEndWith(parameters.titleText, "remote file"),
      click: () => {
        let name = parameters.titleText.substring(0, parameters.titleText.indexOf("\n"));
        appWindow.webContents.send("profiles", "sync", name);
      }
    },
    {
      label: "delete",
      visible: stringEndWith(parameters.titleText, "file") || stringEndWith(parameters.titleText, "connection"),
      click: () => {
        let name = parameters.titleText.substring(0, parameters.titleText.indexOf("\n"));
        appWindow.webContents.send("profiles", "delete", name);
      }
    }
  ]
};

function createWindow() {
  contextMenu(contextMenuConfig);
  appWindow = new BrowserWindow(browserWindowConfig);

  if (process.argv.indexOf("--port") > -1) {
    const portIndex = process.argv.indexOf("--port") + 1;
    const port = process.argv[portIndex];
    appWindow.webContents.openDevTools({ mode: "bottom" });
    process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
    appWindow.loadURL(`http://localhost:${port}`);
  } else {
    appWindow.loadFile("./index.html");
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });

  ipcMain.handle("window", async (event, arg) => {
    switch (arg) {
      case "minimize":
        appWindow.minimize();
        appWindow.webContents.send("window", "minimize");
        break;
      case "maximize":
        appWindow.maximize();
        appWindow.webContents.send("window", "maximize");
        break;
      case "unmaximize":
        appWindow.unmaximize();
        appWindow.webContents.send("window", "unmaximize");
        break;
      case "affix":
        isAlwaysOnTop = !isAlwaysOnTop;
        appWindow.setAlwaysOnTop(isAlwaysOnTop);
        appWindow.webContents.send("window", isAlwaysOnTop ? "affixed" : "unaffix");
        break;
      case "close":
        appWindow.close();
        break;
    }
  });
});

function stringEndWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
