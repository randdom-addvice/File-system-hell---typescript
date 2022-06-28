import CodeMirror from "codemirror/lib/codemirror.js";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/xml/xml";
import "codemirror/mode/javascript/javascript.js";
import { selectDomElement } from "./utils";
import Store from "./store";

// var myCodeMirror = CodeMirror(document.body, {
//   value: "function myScript(){return 100;}\n",
//   mode: "javascript",
//   lineWrapping: true,
// });

const modeMatcher: { [key: string]: string } = {
  ".js": "javascript",
  ".html": "html",
  ".json": "json",
  ".py": "python",
};

export class CodeMirrorManager {
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
    });
    // var myCodeMirror = CodeMirror(document.body, {
    //   value: "function myScript(){return 100;}\n",
    //   mode: "javascript",
    //   lineWrapping: true,
    // });
  }
}

export default CodeMirrorManager;
