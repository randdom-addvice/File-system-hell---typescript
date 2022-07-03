import CodeMirror from "codemirror/lib/codemirror.js";
import "./cmImports";
import { FileModule } from "./interfaces/interface";
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
  private CMInstance: typeof CodeMirror = null;

  removeFileContent() {
    (document.getElementById("file__content") as HTMLElement).innerHTML = "";
    Store.commit("setSelectedFile", null);
  }

  public injectFileContent() {
    (document.getElementById("file__content") as HTMLElement).innerHTML = "";
    const { selectedFile } = Store.getState;
    const cm = CodeMirror(document.getElementById("file__content"), {
      value: selectedFile?.file_content,
      mode: modeMatcher[selectedFile?.file_type || ".js"],
      lineWrapping: true,
      tabSize: 3,
      lineNumbers: true,
      scrollbarStyle: "null",
      autofocus: true,
      indentWithTabs: true,
    });
    cm.on("change", (instance: typeof CodeMirror, event: Event) => {
      this.updateFileOnType(true);
    });
  }

  private updateFileOnType(value: boolean) {
    //update files onView and selected file on localStorage and state
    let file = Store.getState.selectedFile;
    let filesOnView = Store.getState.filesOnView.map((i) => {
      if (i.file_id === file?.file_id) i.modified = value;
      return i;
    });
    if (!file) return;
    file.modified = value;
    console.log(file);
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
