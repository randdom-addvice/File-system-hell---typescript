import uid from "shortid";
import { API } from "./api";
import DragNDrop from "./DnD";
import Store from "./store";
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
  DropDownContext,
  FileBlock,
  FolderBlock,
  renderComponent,
  renderIcon,
  TextField,
  TextFieldErrorMessage,
  unmountComponent,
} from "./components";
import { selectDomElement } from "./utils";
const req = new API();
let DND = new DragNDrop();
class GlobalState {
  protected rootDirPath: string;
  protected rootDirName: string;
  protected workspaceName: string;
  protected currentIdTarget: string | null;
  protected isFolderSelected: boolean | null;

  public constructor() {
    this.rootDirPath = "";
    this.rootDirName = "";
    this.currentIdTarget = null;
    this.isFolderSelected = null;
    this.workspaceName = "Work space";
  }
}

class File extends GlobalState {
  constructor() {
    super();
    this.checkForFilesInDirectories =
      this.checkForFilesInDirectories.bind(this);
    this.handleFileClick = this.handleFileClick.bind(this);
  }
  private handleFileClick(e: MouseEvent): void {
    e.stopPropagation();
    const currentTarget = e.currentTarget as HTMLElement;
    // console.log(this.workspaceName);

    let folder = new Folder();
    if (e.button === 2) {
      this.currentIdTarget = currentTarget.dataset.file_id!;
      this.isFolderSelected = currentTarget.dataset.type === "folder"; //set the "isFolderSelected" property on the Folder class to be used in the "deleteFolderOrFile method"
      folder.showDropDownContext(currentTarget.dataset.file_id!);
    }
  }

  public addEventListenerToFiles() {
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
      this.addEventListenerToFiles();
      Store.commit("setFiles", { id: i.file_id, file: i });
    });
    // collapseAllFolders();
  }
}

class Folder extends GlobalState {
  public constructor() {
    super();
    let methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    methods
      .filter((method) => method !== "constructor")
      .forEach((method: string) => {
        let getterSetters = ["allFolders", "setCurrentIdTarget"];
        if (!getterSetters.includes(method)) {
          //this[method as keyof typeof this] = this
          let _this: { [key: string]: any } = this;
          _this[method] = _this[method].bind(this);
        }
      });
    this.onFolderClick = this.onFolderClick.bind(this);
    this.addFileToDirectory = this.addFileToDirectory.bind(this);
    // this.deleteFileOrFolder = this.deleteFileOrFolder.bind(this);
  }

  private async onTextFieldChange(e: KeyboardEvent): Promise<void> {
    const textFieldContainer = selectDomElement(
      "#textField__wrapper"
    ) as HTMLElement;

    try {
      const value = (e.target as HTMLInputElement).value;
      const fileIcon = selectDomElement(
        `[id='${this.currentIdTarget}'] .text__field-icon`
      ) as HTMLElement;
      const fileName = value.includes(".") ? value.split(".")[0] : value; //exclude the extension name from filename
      const extName = value.includes(".")
        ? value.split(".")[value.split(".").length - 1]
        : ""; //check for extension name
      const selectedFolder =
        Store.getState.folders[this.currentIdTarget!]?.path.split("\\") ||
        this.rootDirPath.split("\\"); //add to root dir if no folder is selected
      const index = selectedFolder.indexOf(this.rootDirName);
      const newFilePath =
        selectedFolder.slice(index + 1).join("/") || this.rootDirPath; // get the rest of the values in the array after a specific index
      const fileExt = value.split(".").pop();
      unmountComponent("textFieldErrorBox");
      fileIcon.innerHTML = renderIcon(`.${extName}`);
      if (e.key === "Enter" || e.code === "Enter") {
        if (!value)
          return textFieldContainer.insertAdjacentHTML(
            "beforeend",
            TextFieldErrorMessage({
              message: "A file or folder name must be entered",
            })
          );

        if (this.isFolderSelected) {
          let newDirPath = `${newFilePath}\\${fileName.trim()}`;
          const res = await req.createDirectory(newDirPath);
          let folderId = uid();
          let folderSplit = newDirPath.split("\\");
          let folderName = folderSplit[folderSplit.length - 1];
          let index = folderSplit.indexOf(this.rootDirName);

          if (index === -1)
            newDirPath = `${
              this.rootDirPath
            }\\${newFilePath}\\${fileName.trim()}`;

          if (!res.data.success) {
            textFieldContainer.insertAdjacentHTML(
              "beforeend",
              TextFieldErrorMessage({
                message: res.data.message,
              })
            );
            return;
          }
          Store.commit("setFolders", {
            id: folderId,
            dir: {
              child: [],
              id: folderId,
              name: folderName,
              path: `${newFilePath}`,
            },
          });
          renderComponent(
            FolderBlock({
              folder_name: fileName,
              id: folderId,
              ...(this.currentIdTarget !== "folder-container" && {
                nested: "nested",
              }), //don't add the nested class if folder is added to the root directory
            }),
            this.currentIdTarget!
          );
        } else {
          let fileId = uid();
          let file = new File();

          let newFile = {
            file_name: fileName,
            file_ext: `.${extName}`,
            output_dir: newFilePath,
            content: "",
          };
          await req.createFile(newFile);
          Store.commit("setFiles", {
            id: fileId,
            file: {
              file_content: "",
              file_id: fileId,
              file_name: fileName,
              file_type: extName,
              file_dir: newFilePath
                ? `${this.rootDirName}\\${newFilePath}\\${fileName}.${extName}`
                : `${this.rootDirName}\\${fileName}.${extName}`,
            },
          });
          renderComponent(
            FileBlock({
              name: fileName,
              id: fileId,
              file_id: fileId,
              ext: `.${extName}`,
            }),
            this.currentIdTarget!
          );
          file.addEventListenerToFiles();
        }

        unmountComponent("explorer__content-input");
        this.addEventListenersToFolders();
      }
      if (e.key === "Escape" || e.code === "Escape")
        unmountComponent("explorer__content-input");
    } catch (error) {
      console.log(error);
    }
  }

  public showDropDownContext(id: string): void {
    unmountComponent("dropdown__context");
    let container = selectDomElement(`[id='${id}']`) as HTMLElement;
    container.insertAdjacentHTML("beforeend", DropDownContext());
    this.addEventListenerToContextDropdown();
  }

  private onFolderClick(e: MouseEvent) {
    e.stopPropagation();
    let currentTarget = e.currentTarget as HTMLElement;
    let folderId = currentTarget.dataset.folder_id as string;
    this.currentIdTarget = folderId;
    this.isFolderSelected = currentTarget.dataset.type === "folder";

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
    // console.log(this.showDropDownContext);

    if (e.button === 2) this.showDropDownContext(folderId);
  }

  private addFileOrFolder(type: string): void {
    // fileOrFolder = type;
    if (!this.currentIdTarget) {
      this.currentIdTarget = "folder-container"; //update ui to add file or folder to root folder container
    }
    const id = Store.getState.folders[this.currentIdTarget]
      ? this.currentIdTarget
      : (this.currentIdTarget = "folder-container"); //incase a folder is removed

    const parentFolder = selectDomElement(`[id='${id}']`) as HTMLElement;
    const isFileInput = type === "file";
    this.isFolderSelected = !isFileInput;
    if (selectDomElement("#explorer__content-input"))
      unmountComponent("explorer__content-input");
    parentFolder.insertAdjacentHTML("beforeend", TextField({ isFileInput }));
    const textField = selectDomElement(
      "#textField__wrapper input"
    ) as HTMLElement;
    textField.focus();
    textField.addEventListener("keyup", (e: KeyboardEvent) =>
      this.onTextFieldChange(e)
    );
  }

  private handleFolderHover(): void {
    let workspaceNameContainer = selectDomElement(
      ".file__name"
    ) as HTMLDivElement;
    let workSpaceNavBtnContainer = selectDomElement(
      ".explorer__content-headerNav ul"
    ) as HTMLUListElement;

    workspaceNameContainer.textContent = `${this.workspaceName.substring(
      0,
      5
    )}...`;
    workSpaceNavBtnContainer.classList.remove("d-none");
  }

  private async deleteFileOrFolder(e: MouseEvent): Promise<void> {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (this.isFolderSelected) {
        let path = Store.getState.folders[this.currentIdTarget!].path;
        await req.deleteDirectory(path);
        Store.commit("deleteFolder", this.currentIdTarget);
        // delete Store.getState.folders[this.currentIdTarget!];
      } else {
        let path = Store.getState.files[this.currentIdTarget!].file_dir;

        // await req.deleteFile(path);
        // delete this.File.files[this.currentIdTarget!];
        // await http.delete("/files/delete", { data: { file_dir: path } });
      }
      unmountComponent(this.currentIdTarget!);
    } catch (error) {
      console.log(error);
      alert("An error occurred");
    }
  }

  private addEventListenerToContextDropdown(): void {
    let deleteBtn = selectDomElement("#delete");
    let renameBtn = selectDomElement("#rename");

    deleteBtn?.addEventListener("mousedown", this.deleteFileOrFolder);
    // renameBtn.addEventListener("mousedown", renameFolder);
  }

  private addEventListenersToFolders() {
    const folders = <HTMLElement[]>(
      Array.from(document.querySelectorAll(".explorer__content-folder"))
    );
    folders.forEach((i) => {
      i.addEventListener("mousedown", this.onFolderClick);
      i.addEventListener("mouseenter", () => this.handleFolderHover()); //call from an arrow function to prevent binding issues with "this"

      i.addEventListener("dragstart", DND.drag);
      i.addEventListener("dragover", DND.dragOver);
      i.addEventListener("drop", DND.dragDrop);
      i.addEventListener("dragleave", DND.dragLeave);
      i.addEventListener("dragend", DND.dragEnd);
    });
  }

  private refreshFolders = () => {
    const container = selectDomElement("#folder-container");
    //remove all folders before refreshing
    if (container) {
      do {
        if (container.firstChild) container.removeChild(container.firstChild);
      } while (container.firstChild);
      renderComponent(BackdropWithSpinner(), "app");
      this.handleFolderCreation();
      this.addGlobalEventListener();
    }
  };

  protected addGlobalEventListener() {
    const addFileBtn = selectDomElement("#add__file") as HTMLElement;
    const addFolderBtn = selectDomElement("#add__folder") as HTMLElement;
    const collapseFoldersBtn = selectDomElement(
      "#collapse__folders"
    ) as HTMLElement;
    const refreshFolderBtn = selectDomElement(
      "#refresh__folders"
    ) as HTMLElement;
    const explorerContainer = selectDomElement(
      ".explorer__content"
    ) as HTMLElement;
    let trashZone = selectDomElement("#trash__zone");

    trashZone?.addEventListener("dragover", DND.trashZoneDragOver);
    trashZone?.addEventListener("drop", DND.dropInTrash);
    trashZone?.addEventListener("dragleave", () =>
      trashZone?.classList.remove("delete__zone--over--dashed")
    );

    // explorerContainer.addEventListener("mousedown", (e: Event) => {
    //   const target = e.target as Element;
    //   if (target.classList.contains("explorer__content"))
    //     this.currentTarget = "folder-container";
    // });
    addFileBtn?.addEventListener("click", () => this.addFileOrFolder("file"));
    addFolderBtn?.addEventListener("click", () =>
      this.addFileOrFolder("folder")
    );
    refreshFolderBtn?.addEventListener("click", this.refreshFolders);
    collapseFoldersBtn.addEventListener("click", () => {
      let el = Array.from(
        document.querySelectorAll(".explorer__content-folder--collapsed")
      );
      let arrowIcons = Array.from(
        document.querySelectorAll(".explorer__content-folder--collapsed i")
      );
      el.forEach((i) =>
        i.classList.remove("explorer__content-folder--collapsed")
      );
      arrowIcons.forEach((i) => i.classList.remove("fa-rotate-90"));
      this.collapseAllFolders();
    });
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

    if (res.data.files?.length) {
      //check if folder has files in it and add it to the current iteration(directory)
      // Object.assign({}, directory, { files: res.data.files }); // directory.files = res.data.files(doesn't work in strict mode)
      directory.files = res.data.files;
      let file = new File();

      file.checkForFilesInDirectories(directory);
      file.addEventListenerToFiles();
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
        Store.commit("setFolders", { id: i.id, dir: i });
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
          Store.commit("setFolders", { id: dir.id, dir });
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
    } catch (error) {
      console.log(error);
    }
  }
}
export { File, Folder };
