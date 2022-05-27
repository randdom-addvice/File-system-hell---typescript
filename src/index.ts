import uid from "shortid";
import { API } from "./api";
import "./styles/styles.scss";
import { IFile, IFolder } from "./interfaces/interface";
import {
  BackdropWithSpinner,
  FolderBlock,
  renderComponent,
  unmountComponent,
} from "./components";
let req = new API();

class Folder {
  private rootDir: string | null;
  private folders: { [key: string]: IFolder }; //{someId: {...IFolder}, someId: {...IFolder}}
  private files: { [key: string]: IFile };
  readonly workspaceName: string;
  constructor() {
    this.rootDir = null;
    this.workspaceName = "Work space";
    this.folders = {};
    this.files = {};
  }

  private addEventListenersToFolders() {
    const folders = document.querySelectorAll(".explorer__content-folder");
    folders.forEach((i) => {
      i.addEventListener("mousedown", () => console.log("clicked"));
    });
  }

  private checkForSubFolders(dir: IFolder) {
    dir.child?.forEach(async (i) => {
      i.id = uid();
      this.folders[i.id] = i;
      renderComponent(
        FolderBlock({ folder_name: i.name, id: i.id, nested: "nested" }),
        "folder-container"
      ); //add a nested folder
      console.log("first");
    });
  }
  public async handleFolderCreation() {
    try {
      let {
        data: { directories, root_dir },
      } = await req.getDirectories();
      this.rootDir = root_dir;

      //wait for the foreach to run before moving to next function call
      let wait: Promise<void> = new Promise((resolve) => {
        directories.forEach(async (dir, index, array) => {
          dir.id = uid();
          this.folders[dir.id] = dir;
          renderComponent(
            FolderBlock({ folder_name: dir.name, id: dir.id }),
            "folder-container"
          ); //render all directories in the root directory
          const res = await req.getFileInDirectory(dir.name); //get all files ina  directory
          if (res.data.files.length) {
            //check if folder has files in it and add it to the current iteration(directory)
            dir.files = res.data.files;
          }
          if (dir.child) this.checkForSubFolders(dir); //check if folder has sub folders

          if (index === array.length - 1) resolve();
        });
      });
      await wait;
      console.log("loop complete");
      this.addEventListenersToFolders();
      unmountComponent("loading-spinner");
      console.log(this.folders);
    } catch (error) {
      console.log(error);
    }
  }
}

class File extends Folder {}

class App extends Folder {
  constructor() {
    super();
  }
  public init() {
    renderComponent(BackdropWithSpinner(), "app");
    this.handleFolderCreation();
  }
}

let app = new App();

window.addEventListener("load", () => app.init());
