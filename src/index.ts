import { Folder } from "./app";
import { BackdropWithSpinner, renderComponent } from "./components";
import { selectDomElement } from "./utils";

class App extends Folder {
  constructor() {
    super();
  }
  public init() {
    renderComponent(BackdropWithSpinner(), "app");
    this.handleFolderCreation();
    this.addGlobalEventListener();
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
      console.log("clicked", e.currentTarget);
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
