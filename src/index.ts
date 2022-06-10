import { Folder } from "./app";
import { BackdropWithSpinner, renderComponent } from "./components";

class App extends Folder {
  constructor() {
    super();
  }
  public init() {
    renderComponent(BackdropWithSpinner(), "app");
    this.handleFolderCreation();
    this.addGlobalEventListener();
  }
}

let app = new App();

window.addEventListener("load", () => app.init());
window.addEventListener("contextmenu", function (e: Event) {
  e.preventDefault();
});
