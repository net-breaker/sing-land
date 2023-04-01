import { app } from "electron";
import { Controller } from "./controller";

app.whenReady().then(() => {
  let instance = new Controller();
  instance.startup();
});
