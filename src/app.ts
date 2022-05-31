import uid from "shortid";
import { API } from "./api";
import DragNDrop from "./DnD";
// import { DnD as DragNDrop } from "./ConcreteImplementation";
import "./styles/styles.scss";

import {
  FileState,
  FolderClass,
  FolderState,
  IFile,
  IFolder,
} from "./interfaces/interface";
import {
  BackdropWithSpinner,
  FileBlock,
  FolderBlock,
  renderComponent,
  unmountComponent,
} from "./components";
import { selectDomElement } from "./utils";
let req = new API();

// let DND = new DragNDrop();

class File {
  public files: FileState;
  // DND: DragNDrop;
  // Folder: Folder;
  constructor() {
    this.files = {};
    // this.Folder = new Folder();
    // this.DND = new DragNDrop(this.Folder.allFolders, this.files);
  }

  get allFiles(): FileState {
    return this.files;
  }

  set setFiles(param: { id: string; file: IFile }) {
    this.files = { ...this.files, [param.id]: param.file };
  }

  private handleFileClick(e: Event) {
    e.stopPropagation();
  }

  public addEventListenerToFiles(DND: DragNDrop) {
    const allFiles = <HTMLElement[]>(
      Array.from(document.querySelectorAll(".explorer__content-file"))
    );

    allFiles.forEach((i) => {
      i.addEventListener("mousedown", this.handleFileClick);

      i.addEventListener("dragstart", DND.drag);
      i.addEventListener("dragover", DND.dragOver);
      i.addEventListener("drop", DND.dragDrop);
      i.addEventListener("dragleave", DND.dragLeave);
      i.addEventListener("dragend", DND.dragEnd);
    });
  }

  public checkForFilesInDirectories(folder: IFolder) {
    folder.files?.forEach(async (i) => {
      i.file_id = uid();
      renderComponent(
        FileBlock({
          name: i.file_name,
          id: i.file_id,
          file_id: i.file_id,
          ext: i.file_type,
        }),
        folder.id
      );
      // this.addEventListenerToFiles();
      this.files[i.file_id] = { ...i };
    });
    // collapseAllFolders();
  }
}

class Folder {
  private rootDirPath: string;
  private rootDirName: string;
  protected folders: FolderState; //{someId: {...IFolder}, someId: {...IFolder}} ( [key: string]: IFolder)
  protected currentTarget: string | null;
  readonly workspaceName: string;
  private File: File;
  DND: DragNDrop;

  public constructor() {
    // super();
    this.rootDirPath = "";
    this.rootDirName = "";
    this.currentTarget = null;
    this.workspaceName = "Work space";
    this.folders = {};
    this.File = new File();
    this.DND = new DragNDrop(this.folders, this.File.allFiles);
  }

  get allFolders(): FolderState {
    return this.folders;
  }

  private onFolderClick(e: MouseEvent) {
    e.stopPropagation();
    let currentTarget = e.currentTarget as HTMLElement;
    let folderId = currentTarget.dataset.folder_id as string;
    this.currentTarget = folderId;

    if (e.button === 0) {
      //detect a left click on folder-click
      const children = Array.from(currentTarget.children);
      const folderArrowIcon = <HTMLElement>(
        document.querySelector(`[id='${folderId}'] i.fa-angle-right`)
      );
      const subFolders = children.filter((i) =>
        Array.from(i.classList).includes("nested")
      ); //get all children item in the parent folder being clicked

      folderArrowIcon?.classList.toggle("fa-rotate-90");
      currentTarget.classList.toggle("explorer__content-folder--collapsed");
      subFolders.forEach((i) => i.classList.toggle("d-none"));
    }
    //  if (e.button === 2) showDropDownContext(folderId);
  }

  private addEventListenersToFolders() {
    const folders = <HTMLElement[]>(
      Array.from(document.querySelectorAll(".explorer__content-folder"))
    );
    folders.forEach((i) => {
      i.addEventListener("mousedown", this.onFolderClick);

      i.addEventListener("dragstart", this.DND.drag);
      i.addEventListener("dragover", this.DND.dragOver);
      i.addEventListener("drop", this.DND.dragDrop);
      i.addEventListener("dragleave", this.DND.dragLeave);
      i.addEventListener("dragend", this.DND.dragEnd);
    });
  }

  protected addGlobalEventListener() {
    const addFileBtn = selectDomElement("#add__file");
    const addFolderBtn = selectDomElement("#add__folder");
    const collapseFoldersBtn = selectDomElement("#collapse__folders");
    const refreshFolderBtn = selectDomElement("#refresh__folders");
    const explorerContainer = selectDomElement(".explorer__content");
    let trashZone = selectDomElement("#trash__zone");

    trashZone?.addEventListener("dragover", this.DND.trashZoneDragOver);
    trashZone?.addEventListener("drop", this.DND.dropInTrash);
    trashZone?.addEventListener("dragleave", () =>
      trashZone?.classList.remove("delete__zone--over--dashed")
    );

    // explorerContainer.addEventListener("mousedown", (e) => {
    //   console.log("event from parent fired", e.target.classList);
    //   if (e.target.classList.contains("explorer__content"))
    //     currentFolderTarget = "folder-container";
    // });
    // addFileBtn?.addEventListener("click", () => addFileOrFolder("file"));
    // addFolderBtn?.addEventListener("click", () => addFileOrFolder("folder"));
    // refreshFolderBtn?.addEventListener("click", refreshFolders);
    // collapseFoldersBtn>.addEventListener("click", () => {
    //   let el = Array.from(
    //     document.querySelectorAll(".explorer__content-folder--collapsed")
    //   );
    //   let arrowIcons = Array.from(
    //     document.querySelectorAll(".explorer__content-folder--collapsed i")
    //   );
    //   el.forEach((i) =>
    //     i.classList.remove("explorer__content-folder--collapsed")
    //   );
    //   arrowIcons.forEach((i) => i.classList.remove("fa-rotate-90"));
    //   collapseAllFolders();
    // });
  }

  /**
   * @interface: IDirectory
   * derive the path from current iteration path based on the index of the rootPathName in the splitted array
   * e.g:
   * if path = C:\\Users\\HP\\Documents\\NODEJS PROJECTS\\File system\\myFiles\\allDocs\\nested;
   * then: derivedPath = [allDocs, nested]
   */
  private async addFileToDirectory(directory: IFolder) {
    let selectedFolder = directory.path.split("\\");
    let pathIndex = selectedFolder.indexOf(this.rootDirName);
    let newFilePath = selectedFolder.slice(pathIndex + 1).join("/");
    const res = await req.getFileInDirectory(newFilePath);

    if (res.data.files.length) {
      //check if folder has files in it and add it to the current iteration(directory)
      directory.files = res.data.files;

      this.File.checkForFilesInDirectories(directory);
      this.File.addEventListenerToFiles(this.DND);
      this.collapseAllFolders();
    }
  }

  private async checkForSubFolders(dir: IFolder) {
    if (dir.child) {
      dir.child.forEach(async (i) => {
        i.id = uid();
        renderComponent(
          FolderBlock({ folder_name: i.name, id: i.id, nested: "nested" }),
          `${dir.id}`
        ); //add a nested folder inside of the parent
        this.addFileToDirectory(i);
        if (i.child && i.child.length) this.checkForSubFolders(i); //check if subfolder also has a child the re-run function
      });
    }
  }

  private collapseAllFolders() {
    const nestedBlocks = <HTMLElement[]>(
      Array.from(document.querySelectorAll(".nested"))
    );
    nestedBlocks.forEach((el) => el.classList.add("d-none"));
    unmountComponent("loading-spinner");
  }

  public async handleFolderCreation() {
    try {
      let {
        data: { directories, root_dir },
      } = await req.getDirectories();
      this.rootDirPath = root_dir;
      this.rootDirName = root_dir.split("\\").slice(-1)[0]; //.pop();

      //wait for the foreach to run before moving to next function call
      let wait: Promise<void> = new Promise((resolve) => {
        directories.forEach(async (dir, index, array) => {
          dir.id = uid();
          this.folders[dir.id] = dir;
          renderComponent(
            FolderBlock({ folder_name: dir.name, id: dir.id }),
            "folder-container"
          ); //render all directories in the root directory

          this.addFileToDirectory(dir);
          this.checkForSubFolders(dir);
          if (index === array.length - 1) resolve();
        });
      });
      await wait;
      this.addEventListenersToFolders();
      console.log("loop complete", this.folders);
    } catch (error) {
      console.log(error);
    }
  }
}

export { File, Folder };
