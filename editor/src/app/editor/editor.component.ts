import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import * as chokidar from "chokidar";
import { ipcRenderer } from "electron";
import * as fs from "fs";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import * as path from "path";
import { SweetAlertResult } from "sweetalert2";
import { AlertService } from "../core/alert.service";
import { EventService } from "../core/event.service";
import { UtilsService } from "../core/utils.service";

@Component({
  selector: "app-editor",
  templateUrl: "./editor.component.html",
  styleUrls: ["./editor.component.scss"]
})
export class EditorComponent implements OnInit {
  @ViewChild("editor", { read: ElementRef, static: true })
  editorElement!: ElementRef<HTMLElement>;
  editorInstance!: monaco.editor.IStandaloneCodeEditor;
  filePath!: string;
  fileName!: string;
  fileContentChanged = false;
  fileWatcher!: chokidar.FSWatcher;

  constructor(utilsService: UtilsService, private eventService: EventService, private alertService: AlertService) {
    this.filePath = utilsService.filePath;
    this.fileName = path.basename(this.filePath);
    // watch file changes
    // todo: don't watch file,should reload file if editor get focus
    this.fileWatcher = chokidar.watch(path.parse(this.filePath).dir);
    this.fileWatcher.on("change", (changedPath) => {
      if (this.fileName !== path.basename(changedPath)) return;
      if (!this.fileContentChanged) this.reloadFileFromDisk(false, false);
    });
    // observe tool bar events
    this.eventService.eventObservable.subscribe((event) => {
      switch (event) {
        case "RELOAD_FROM_DISK":
          this.reloadFileFromDisk(true, true);
          break;
        case "SAVE_TO_DISK":
          this.saveFileToDisk();
          break;
      }
    });
    // blocking window closing when unsaved changes
    window.onbeforeunload = (event) => {
      if (this.fileContentChanged) {
        this.alertService.saveChanges().then((result: SweetAlertResult) => {
          if (result.isConfirmed) this.saveFileToDisk();
          // if clicked is not cancel button,then close the window
          if (!result.isDismissed) {
            this.fileContentChanged = false;
            ipcRenderer.invoke("window", "close");
          }
        });
        event.returnValue = false;
      }
    };
  }

  ngOnInit() {
    this.editorInitialized();
    // editor content changed
    this.editorInstance.onDidChangeModelContent(() => {
      this.fileContentChanged = true;
    });
  }

  editorInitialized() {
    this.editorInstance = monaco.editor.create(this.editorElement.nativeElement, {
      value: fs.readFileSync(this.filePath, "utf8"),
      language: "yaml",
      theme: "vs-dark",
      wordWrap: "off",
      automaticLayout: true,
      scrollbar: {
        useShadows: false,
        verticalHasArrows: true,
        horizontalHasArrows: true,
        vertical: "visible",
        horizontal: "visible",
        verticalScrollbarSize: 17,
        horizontalScrollbarSize: 17,
        arrowSize: 30
      },
      minimap: {
        enabled: true
      }
    });
    this.editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => this.saveFileToDisk());
  }

  reloadFileFromDisk(force: boolean, notify: boolean) {
    const fileContentOnDisk = fs.readFileSync(this.filePath, "utf8");
    const fileContentOnEditor = this.editorInstance.getValue();
    if (!force && fileContentOnDisk === fileContentOnEditor) return;
    this.editorInstance.setValue(fileContentOnDisk);
    this.fileContentChanged = false;
    if (notify) this.alertService.info("File reloaded from disk");
  }

  saveFileToDisk() {
    const fileContentOnDisk = fs.readFileSync(this.filePath, "utf8");
    const fileContentOnEditor = this.editorInstance.getValue();
    if (fileContentOnDisk === fileContentOnEditor) {
      this.alertService.info("Nothing has been changed");
    } else {
      fs.writeFileSync(this.filePath, fileContentOnEditor);
      this.fileContentChanged = false;
      this.alertService.success("File saved successfully");
    }
  }

  ngOnDestroy() {
    this.fileWatcher.close();
    this.editorInstance.dispose();
  }
}
