import CodeMirror from "codemirror/lib/codemirror.js";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/theme/ambiance-mobile.css";
import "codemirror/theme/cobalt.css";
import "codemirror/theme/3024-day.css";
import "codemirror/theme/midnight.css";
import "codemirror/theme/paraiso-light.css";
import "codemirror/mode/xml/xml";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/css/css";
import "codemirror/mode/python/python";
import "codemirror/mode/ruby/ruby";
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
