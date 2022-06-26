import { Folder } from "./app";
import { BackdropWithSpinner, renderComponent } from "./components";
import { selectDomElement } from "./utils";
// const obj = {
//   foo: "bar",
// };
const obj = {
  fooValue: "bar",
  get foo() {
    return this.fooValue;
  },
  set foo(val) {
    this.fooValue = val;
    this.fooListener(val);
  },
  fooListener: function (val: any) {
    console.log("listening", val);
  },
  registerNewListener: function (externalListenerFunction: any) {
    // console.log("listening");
    this.fooListener = externalListenerFunction;
  },
};
obj.registerNewListener((val: any) => console.log(`New Value from cb: ${val}`));
// setInterval(() => {
//   obj.foo = "new";
// }, 2000);
// const objProxy = new Proxy(obj, {
//   set: function (target: any, key, value) {
//     console.log(`${String(key)} set from ${obj.foo} to ${value}`);
//     target[key] = value;
//     return true;
//   },
// });
// objProxy.foo = "barz";
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
  }
}

let app = new App();

window.addEventListener("load", () => app.init());
window.addEventListener("contextmenu", function (e: Event) {
  e.preventDefault();
});
