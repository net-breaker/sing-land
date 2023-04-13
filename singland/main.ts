import { Menu, Tray, app, ipcMain, nativeImage } from "electron";
import * as fs from "fs";
import { Controller } from "./controller";
import { Editor } from "./editor";

let tray: Tray;
let controller: Controller;
let editors = new Array<Editor>();

app.whenReady().then(() => {
  controller = new Controller();
  controller.startup();
  createTray();
});

function createTray() {
  const icon = getIconPath();
  const trayicon = nativeImage.createFromPath(icon);
  tray = new Tray(trayicon.resize({ width: 16 }));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open",
      click: () => {
        controller.show();
      },
    },
    {
      label: "Quit",
      click: () => {
        controller.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip("Singland");
  tray.on("click", () => {
    controller.show();
  });
}

ipcMain.handle("coder", async (event, filePath) => {
  let editor = editors.find((editor) => editor.filePath === filePath);
  switch (editor) {
    case undefined:
      let instance = new Editor(filePath);
      editors.push(instance);
      instance.startup();
      break;
    default:
      editor.startup();
      break;
  }
});

function getIconPath() {
  let icon = `${process.resourcesPath}/icons/logo-32.png`;

  const exsitOnWorkspace = fs.existsSync("./icons/logo-32.png");
  if (exsitOnWorkspace) icon = "./icons/logo-32.png";

  return icon;
}
