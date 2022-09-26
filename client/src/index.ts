import { File, Folder } from "./app";
import CodeMirrorManager from "./cm";
import { BackdropWithSpinner, renderComponent } from "./components";
import Store from "./store";
import { selectDomElement } from "./utils";
const CM = new CodeMirrorManager();

class App extends Folder {
  constructor() {
    super();
  }

  public init() {
    const file = new File();

    renderComponent(BackdropWithSpinner(), "app");
    this.handleFolderCreation();
    this.addGlobalEventListener();
    Store.commit("setFilesOnViewFromLocalStorage");
    // const filesOnView = Store.getState.filesOnView;
    // if (filesOnView.length) {
    //   filesOnView.forEach((i) => {
    //     const fileEditorContainer = document.getElementById(
    //       "file__content"
    //     ) as HTMLElement;
    //     const editorHTML = `<div data-editor_cm_id=${i.file_id} class="e"></div>`;
    //     fileEditorContainer.innerHTML += editorHTML;
    //     // console.log(fileEditorContainer);
    //     file.addFileToFileOnView("", i);
    //     // console.log(i);
    //     // file.viewFile(Store.getState.selectedFile || filesOnView[0]);
    //     file.addFileToOpenEditors("", i);
    //     CM.injectFileContent(i.file_id, i); //not included yet
    //   });
    // }
    file.initEditor();
    const foldersContainer = selectDomElement(".explorer__content");
    const workSpaceToggler = selectDomElement("#workspace-toggler");
    const editorToggler = selectDomElement("#open-editors-toggler");

    foldersContainer?.addEventListener("mouseover", this.handleFolderHover);
    foldersContainer?.addEventListener("mouseout", this.onFolderMouseOut);
    workSpaceToggler?.addEventListener("click", (e: MouseEvent) => {
      let icon = selectDomElement("#workspace-toggler i.fa-angle-right");
      let explorerFolders = selectDomElement("#folder-container");
      icon?.classList.toggle("fa-rotate-90");
      explorerFolders?.classList.toggle(
        "explorer__content-container--collapsed"
      );
    });
    editorToggler?.addEventListener("click", () => {
      const icon = selectDomElement("#open-editors i.fa-angle-right");
      const editorsContainer = selectDomElement("#editors-container");
      icon?.classList.toggle("fa-rotate-90");
      editorsContainer?.classList.toggle("explorer__content-editor--collapsed");
    });
  }
}

let app = new App();

window.addEventListener("load", () => app.init());
window.addEventListener("contextmenu", function (e: Event) {
  e.preventDefault();
});
