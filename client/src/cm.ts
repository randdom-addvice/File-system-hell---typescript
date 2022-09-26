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
  ".scss": "css",
  ".rb": "ruby",
};

export class CodeMirrorManager {
  public CMInstance: { [key: string]: typeof CodeMirror } = {};
  public CMInstance2: typeof CodeMirror = null;

  get getCM(): any {
    return this.CMInstance;
  }
  get getCM2(): any {
    return this.CMInstance2;
  }

  removeFileContent() {
    (document.getElementById("file__content") as HTMLElement).innerHTML = "";
    Store.commit("setSelectedFile", null);
  }

  public injectCM(file: IFile) {
    const editor = CodeMirror(document.getElementById(`cm-${file.file_id}`), {
      lineNumbers: true,
      autoRefresh: true,
      value: file?.file_content,
      mode: modeMatcher[file?.file_type || ".js"],
      lineWrapping: true,
      tabSize: 8,
      scrollbarStyle: "null",
      autofocus: false,
      indentWithTabs: true,
    });
    editor.on("change", (instance: typeof CodeMirror, event: Event) => {
      this.updateFileOnType(true, file);
    });
    this.CMInstance[file.file_id] = editor;
  }

  public injectFileContent(filesOnView: IFile[]) {
    filesOnView.forEach((i) => {
      this.injectCM(i);
    });
  }

  public updateFileOnType(value: boolean, file: IFile) {
    //update files onView and selected file on localStorage and state
    // let file = Store.getState.selectedFile;
    let filesOnView = Store.getState.filesOnView.map((i) => {
      if (i.file_dir === file?.file_dir) {
        i.modified = value;
        i.file_content = file.file_content;
      }
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
    ]?.forEach((i) => {
      value
        ? i?.classList.add("status--visible")
        : i?.classList.remove("status--visible");
    }); //update the status view
  }
}

export default CodeMirrorManager;
