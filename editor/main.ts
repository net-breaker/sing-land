import { app } from "electron";
import { Editor } from "./editor";

app.whenReady().then(() => {
  let arg = process.argv.find((val, index) => {
    val.indexOf("--path") === 0;
  });
  if (arg === undefined) throw new Error("No file path argument found");
  let path = arg.split("=")[1];
  let instance = new Editor(path);
  instance.startup();
});
