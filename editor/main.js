const { app, BrowserWindow, ipcMain } = require("electron");

let appWindow;
let isAlwaysOnTop = false;

function createWindow() {
  const pathIndex = process.argv.indexOf("--path") + 1;
  const path = process.argv[pathIndex];

  appWindow = new BrowserWindow({
    width: 850,
    height: 600,
    minWidth: 850,
    minHeight: 600,
    // mac title menu
    titleBarStyle: "hiddenInset",
    autoHideMenuBar: false,
    frame: false,
    vibrancy: "sidebar",
    visualEffectState: "followWindow",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      additionalArguments: ["--path", path]
    }
  });

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
    console.log("activate");
    if (BrowserWindow.getAllWindows().length === 0) {
      appWindow = createWindow();
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
        appWindow.webContents.send("window", isAlwaysOnTop ? "affix" : "unaffix");
        break;
      case "close":
        appWindow.close();
        break;
    }
  });
});
