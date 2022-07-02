import CodeMirror from "codemirror/lib/codemirror.js";
import "./cmImports";
import Store from "./store";

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
  removeFileContent() {
    (document.getElementById("file__content") as HTMLElement).innerHTML = "";
    Store.commit("setSelectedFile", null);
  }
  injectFileContent() {
    (document.getElementById("file__content") as HTMLElement).innerHTML = "";
    const { selectedFile } = Store.getState;
    CodeMirror(document.getElementById("file__content"), {
      value: selectedFile?.file_content,
      mode: modeMatcher[selectedFile?.file_type || ".js"],
      lineWrapping: true,
      tabSize: 3,
      lineNumbers: true,
      scrollbarStyle: "null",
      autofocus: true,
      indentWithTabs: true,
      //   theme: "paraiso-light",
    });
  }
}

export default CodeMirrorManager;
