import { app, ipcMain } from "electron";
import { Controller } from "./controller";
import { Editor } from "./editor";

let controller: Controller;
let editors = new Array<Editor>();

app.whenReady().then(() => {
  controller = new Controller();
  controller.startup();
});

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
