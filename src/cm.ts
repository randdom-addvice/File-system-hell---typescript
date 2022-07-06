import CodeMirror from "codemirror/lib/codemirror.js";
import "./cmImports";
import { FileModule, IFile } from "./interfaces/interface";
import Store from "./store";
import UseLocalStorage from "./useLocalStorage";
import { selectDomElement } from "./utils";
const LS = UseLocalStorage.getInstance();

const modeMatcher: { [key: string]: string } = {
  ".js": "javascript",
  ".html": "html",
  ".json": "json",
  ".py": "python",
  ".css": "css",
  ".scss": "scss",
  ".rb": "ruby",
};

export class CodeMirrorManager {
  public CMInstance: typeof CodeMirror = null;
  public CMInstance2: { [key: string]: typeof CodeMirror } = {};

  get getCM2(): any {
    return this.CMInstance2;
  }
  get getCM(): any {
    return this.CMInstance;
  }

  removeFileContent() {
    (document.getElementById("file__content") as HTMLElement).innerHTML = "";
    Store.commit("setSelectedFile", null);
  }

  public injectFileContent(id: string, file: IFile) {
    // (document.getElementById("file__content") as HTMLElement).innerHTML = "";
    const { selectedFile } = Store.getState;
    const cm = CodeMirror.fromTextArea(
      document.querySelector(`[data-editor_cm_id="${id}"`),
      {
        value: file?.file_content,
        mode: modeMatcher[file?.file_type || ".js"],
        lineWrapping: true,
        tabSize: 8,
        lineNumbers: true,
        scrollbarStyle: "null",
        autofocus: false,
        indentWithTabs: true,
        autoRefresh: true,
      }
    );
    cm.save();
    this.CMInstance2[file.file_id] = cm;
    // this.CMInstance2[file.file_id].save();
    // this.CMInstance = cm;
    // this.CMInstance2[file.file_id] = cm;
    // console.log(this.CMInstance2);
    // cm.on("change", (instance: typeof CodeMirror, event: Event) => {
    //   this.updateFileOnType(true);
    //   // console.log(cm.getDoc());
    //   // console.log(cm.getDoc().children);

    //   // console.log(document);
    // });
  }
  public injectFileContentToTextArea(filesOnView: IFile[]) {
    filesOnView.forEach((i) => {
      var editors = document.getElementsByClassName("e");

      // for (var x = 0; x < editors.length; x++) {
      // var self = editors[x];
      var editor = CodeMirror(document.getElementById(`cm-${i.file_id}`), {
        // mode: "javascript",
        lineNumbers: true,
        autoRefresh: true,
        value: i?.file_content,
        mode: modeMatcher[i?.file_type || ".js"],
        lineWrapping: true,
        tabSize: 8,
        scrollbarStyle: "null",
        autofocus: false,
        indentWithTabs: true,
      });
      // editor.save();
      this.CMInstance2[i.file_id] = editor;
      // }
    });
  }

  public updateFileOnType(value: boolean) {
    //update files onView and selected file on localStorage and state
    let file = Store.getState.selectedFile;
    let filesOnView = Store.getState.filesOnView.map((i) => {
      if (i.file_id === file?.file_id) i.modified = value;
      return i;
    });
    if (!file) return;
    file.modified = value;

    Store.commit("setSelectedFile", file);
    Store.commit("setFilesOnView", filesOnView);
    LS.setSelectedFile(file);
    LS.setFilesOnView(filesOnView);
    [
      selectDomElement(`[data-editor_file_id="${file.file_id}"] .status`),
      selectDomElement(`[data-file_view_id="${file.file_id}"] .status`),
    ]?.forEach((i) => i?.classList.add("status--visible")); //update the status view
  }
}

export default CodeMirrorManager;
