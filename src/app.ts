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
  FileView,
  FolderBlock,
  OpenEditorFile,
  renderComponent,
  renderIcon,
  TextField,
  TextFieldErrorMessage,
  unmountComponent,
} from "./components";
import { attachEvent, deleteDomElement, selectDomElement } from "./utils";
import { AxiosError } from "axios";
import CodeMirrorManager from "./cm";
const req = new API();
const DND = new DragNDrop();
const CM = new CodeMirrorManager();

interface StateInterface {
  rootDirPath: string;
  rootDirName: string;
  workspaceName: string;
  currentIdTarget: string | null /* folder or file id being clicked on */;
  isFolderSelected:
    | boolean
    | null /* boolean folder to determine if a folder or file is clicked */;
}

const state: StateInterface = {
  rootDirPath: "",
  rootDirName: "",
  currentIdTarget: null,
  isFolderSelected: null,
  workspaceName: "Work space",
};
class File {
  constructor() {
    this.checkForFilesInDirectories =
      this.checkForFilesInDirectories.bind(this);
    this.handleFileClick = this.handleFileClick.bind(this);
  }

  private handleFileClick(e: MouseEvent): void {
    e.stopPropagation();
    const currentTarget = e.currentTarget as HTMLElement;
    state.isFolderSelected = currentTarget.dataset.type === "folder";
    state.currentIdTarget = currentTarget.dataset.file_id!;
    const file = Store.getState.files[state.currentIdTarget];
    if (!file) return;
    this.addFileToFileOnView(state.currentIdTarget, file);
    this.addFileToOpenEditors(state.currentIdTarget, file);

    Store.commit("addFileToFileOnView", file);
    Store.commit("setSelectedFile", file);
    this.viewFile(file);
    let folder = new Folder();
    if (e.button === 2) {
      state.isFolderSelected = false; //currentTarget.dataset.type === "folder"; //set the "isFolderSelected" property on the Folder class to be used in the "deleteFolderOrFile method"
      folder.showDropDownContext(currentTarget.dataset.file_id!);
    }
  }

  private viewFile(file: IFile): void {
    Store.commit("setSelectedFile", file);
    CM.injectFileContent();
  }

  private addFileToFileOnView(id: string, file: IFile): void {
    const container = selectDomElement("#explorer__view-header-group");
    const isExist = Store.getState.filesOnView.find((i) => i.file_id === id);
    if (isExist) return;
    container?.appendChild(
      FileView({
        name: file.file_name,
        id: file.file_id,
        saved: false,
        ext: file.file_type,
        remove: (e: MouseEvent) => {
          e.stopPropagation();
          this.removeFileFromOnView(file.file_id);
        },
        viewFile: () => this.viewFile(file),
      })
    );
  }

  private addFileToOpenEditors(id: string, file: IFile): void {
    const container = selectDomElement("#editors-container");
    const isExist = Store.getState.filesOnView.find((i) => i.file_id === id);
    if (isExist) return;
    container?.appendChild(
      OpenEditorFile({
        name: file.file_name,
        id: file.file_id,
        saved: false,
        ext: file.file_type,
        remove: (e: MouseEvent) => {
          e.stopPropagation();
          this.removeFileFromOnView(file.file_id);
        },
        viewFile: () => this.viewFile(file),
      })
    );
  }

  private removeFileFromOnView(id: string) {
    Store.commit("removeFileFromView", id);
    const fileOnView = selectDomElement(`[data-file_view_id='${id}']`);
    const fileInEditor = selectDomElement(`[data-editor_file_id='${id}']`);
    fileOnView?.remove();
    fileInEditor?.remove();
    CM.removeFileContent();
  }

  public addEventListenerToFiles() {
    const allFiles = <HTMLElement[]>(
      Array.from(document.querySelectorAll(".explorer__content-file"))
    );

    allFiles.forEach((i) => {
      i.onmousedown = this.handleFileClick;

      i.ondragstart = DND.drag;
      i.ondragover = DND.dragOver;
      i.ondrop = DND.dragDrop;
      i.ondragleave = DND.dragLeave;
      i.ondragend = DND.dragEnd;
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
  }
}

class Folder {
  private currentElementTarget: HTMLElement | null = null;
  public constructor() {
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
    this.deleteFileOrFolder = this.deleteFileOrFolder.bind(this);
  }

  private async onTextFieldChange(e: KeyboardEvent): Promise<void> {
    const textFieldContainer = selectDomElement(
      "#textField__wrapper"
    ) as HTMLElement;

    try {
      const value = (e.target as HTMLInputElement).value;
      const fileIcon = selectDomElement(
        `[id='${state.currentIdTarget}'] .text__field-icon`
      ) as HTMLElement;
      const fileName = value.includes(".") ? value.split(".")[0] : value; //exclude the extension name from filename
      const extName = value.includes(".")
        ? value.split(".")[value.split(".").length - 1]
        : ""; //check for extension name
      const selectedFolder =
        Store.getState.folders[state.currentIdTarget!]?.path.split("\\") ||
        state.rootDirPath.split("\\"); //add to root dir if no folder is selected
      const index = selectedFolder.indexOf(state.rootDirName);
      const newFilePath =
        selectedFolder.slice(index + 1).join("/") || state.rootDirPath; // get the rest of the values in the array after a specific index
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

        if (state.isFolderSelected) {
          let newDirPath = `${newFilePath}\\${fileName.trim()}`;
          // console.log(state.currentIdTarget);

          const res = await req.createDirectory(newDirPath);
          let folderId = uid();
          let folderSplit = newDirPath.split("\\");
          let folderName = folderSplit[folderSplit.length - 1];
          let index = folderSplit.indexOf(state.rootDirName);

          if (index === -1)
            newDirPath = `${
              state.rootDirPath
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
              path: `${newDirPath}`,
            },
          });
          renderComponent(
            FolderBlock({
              folder_name: fileName,
              id: folderId,
              ...(state.currentIdTarget !== "folder-container" && {
                nested: "nested",
              }), //don't add the nested class if folder is added to the root directory
            }),
            state.currentIdTarget!
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
              file_type: `.${extName}`,
              file_dir: newFilePath
                ? `${state.rootDirName}\\${newFilePath}\\${fileName}.${extName}`
                : `${state.rootDirName}\\${fileName}.${extName}`,
            },
          });
          renderComponent(
            FileBlock({
              name: fileName,
              id: fileId,
              file_id: fileId,
              ext: `.${extName}`,
            }),
            state.currentIdTarget!
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

  private expandFolder(folderTarget: HTMLElement, folderId: string): void {
    const children = Array.from(folderTarget.children);
    const folderArrowIcon = <HTMLElement>(
      document.querySelector(
        `[id='${folderId || state.currentIdTarget}'] i.fa-angle-right`
      )
    );
    const subFolders = children.filter((i) => i.classList.contains("nested")); //get all children item in the parent folder being clicked

    folderArrowIcon?.classList.toggle("fa-rotate-90");
    folderTarget.classList.toggle("explorer__content-folder--collapsed");
    subFolders.forEach((i) => i.classList.toggle("d-none"));
  }

  private onFolderClick(e: MouseEvent): void {
    e.stopPropagation();
    let currentTarget = e.currentTarget as HTMLElement;
    let folderId = currentTarget.dataset.folder_id as string;
    state.currentIdTarget = folderId;
    state.isFolderSelected = currentTarget.dataset.type === "folder";

    if (e.button === 0) this.expandFolder(currentTarget, folderId);
    if (e.button === 2) this.showDropDownContext(folderId);
  }

  private addFileOrFolder(type: "file" | "folder"): void {
    // fileOrFolder = type;
    if (!state.currentIdTarget) {
      state.currentIdTarget = "folder-container"; //update ui to add file or folder to root folder container
    }
    const id = Store.getState.folders[state.currentIdTarget]
      ? state.currentIdTarget
      : (state.currentIdTarget = "folder-container"); //incase a folder is removed

    const parentFolder = selectDomElement(`[id='${id}']`) as HTMLElement;
    const isFileInput = type === "file";
    state.isFolderSelected = !isFileInput;
    if (selectDomElement("#explorer__content-input"))
      unmountComponent("explorer__content-input");
    parentFolder.insertAdjacentHTML("beforeend", TextField({ isFileInput }));
    const textField = selectDomElement(
      "#textField__wrapper input"
    ) as HTMLElement;
    setTimeout(() => textField.focus(), 10);
    textField.addEventListener("keyup", (e: KeyboardEvent) =>
      this.onTextFieldChange(e)
    );
    textField.addEventListener("mousedown", (e: MouseEvent) =>
      e.stopPropagation()
    );
  }

  private async deleteFileOrFolder(e: MouseEvent): Promise<void> {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (state.isFolderSelected) {
        let path = Store.getState.folders[state.currentIdTarget!].path;
        await req.deleteDirectory(path);
        Store.commit("deleteFolder", state.currentIdTarget);
      } else {
        if (state.currentIdTarget) {
          let path = Store.getState.files[state.currentIdTarget].file_dir;
          await req.deleteFile(path);
          Store.commit("deleteFile", state.currentIdTarget);
          req.deleteFile(path);
        }
      }
      unmountComponent(state.currentIdTarget!);
    } catch (error) {
      console.log(error);
      // alert("An error occurred");
    }
  }

  private async onRenameInputChange(e: KeyboardEvent): Promise<void> {
    e.stopPropagation();
    ("folder"); //check if we right clicked on a folder or file
    let defaultValue = (e.target as HTMLInputElement).defaultValue;
    let value = (e.target as HTMLInputElement).value;
    let textNode = document.createTextNode(value);
    let fileIcon = selectDomElement(
      `[id='${state.currentIdTarget}'] .fileIcon__wrapper`
    ) as HTMLElement;
    let fileExt = value.split(".").pop();

    if (!state.isFolderSelected) fileIcon.innerHTML = renderIcon(`.${fileExt}`); //update file icon on tying
    try {
      if (e.key === "Enter" || e.code === "Enter") {
        if (state.isFolderSelected)
          await req.renameFolder({
            old_file_path: Store.getState.folders[state.currentIdTarget!].path,
            new_directory_name: value,
          });
        if (state.isFolderSelected === false)
          await req.renameFile({
            old_file_path:
              Store.getState.files[state.currentIdTarget!].file_dir,
            new_file_name: value,
          });
        this.currentElementTarget?.replaceChild(
          textNode,
          this.currentElementTarget.childNodes[0]
        );
      }
      if (e.key === "Escape" || e.code === "Escape") {
        textNode.nodeValue = defaultValue;
        if (!state.isFolderSelected)
          fileIcon.innerHTML = renderIcon(`.${defaultValue.split(".").pop()}`); //reset the file extension and value to it's initial state
        this.currentElementTarget?.replaceChild(
          textNode,
          this.currentElementTarget.childNodes[0]
        );
      }
    } catch (error) {
      console.log(error);
      let err = error as AxiosError;
      if (error instanceof Error && err.response && err.response.status === 400)
        return alert((err.response?.data as { message: string }).message);
      alert("OOps an error occurred");
    }
  }

  private renameFolder = async (e: MouseEvent): Promise<void> => {
    e.stopPropagation();
    let target = selectDomElement(
      `[id='${state.currentIdTarget}'] .name__wrapper`
    );
    this.currentElementTarget = target;
    let value = target?.textContent;
    let inputNode = document.createElement("input");
    Object.assign(inputNode, {
      className: "rename__input",
      id: "rename__input",
      value,
      defaultValue: value,
      onkeyup: this.onRenameInputChange,
      autocomplete: "off",
      onmousedown: (ev: MouseEvent) => ev.stopPropagation(),
    });
    target?.replaceChild(inputNode, target.childNodes[0]);
    setTimeout(() => document.getElementById("rename__input")?.focus(), 0); //not sure why the setTimeout works on the function, but it did
    unmountComponent("dropdown__context");
  };

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

  private addEventListenerToContextDropdown(): void {
    let deleteBtn = selectDomElement("#delete");
    let renameBtn = selectDomElement("#rename");
    let addFolderBtn = selectDomElement("#add__folder-context");
    let addFileBtn = selectDomElement("#add__file-context");

    deleteBtn?.addEventListener("mousedown", this.deleteFileOrFolder);
    renameBtn?.addEventListener("mousedown", this.renameFolder);

    const addFolderOrFileContextEvent = (type: "file" | "folder") => {
      const selectedFolder = selectDomElement(
        `[id='${state.currentIdTarget}']`
      ) as HTMLElement;
      if (
        !selectedFolder?.classList.contains(
          "explorer__content-folder--collapsed"
        )
      )
        this.expandFolder(selectedFolder, state.currentIdTarget || "");
      this.addFileOrFolder(type);
      unmountComponent("dropdown__context");
    };

    addFolderBtn?.addEventListener("mousedown", (e: MouseEvent) => {
      e.stopPropagation();
      addFolderOrFileContextEvent("folder");
    });
    addFileBtn?.addEventListener("mousedown", (e: MouseEvent) => {
      e.stopPropagation();
      addFolderOrFileContextEvent("file");
    });
  }

  private addEventListenersToFolders() {
    const folders = <HTMLElement[]>(
      Array.from(document.querySelectorAll(".explorer__content-folder"))
    );
    folders.forEach((i) => {
      i.addEventListener("mousedown", this.onFolderClick);
      // i.addEventListener("mouseenter", () => this.handleFolderHover()); //call from an arrow function to prevent binding issues with "this"

      i.addEventListener("dragstart", DND.drag);
      i.addEventListener("dragover", DND.dragOver);
      i.addEventListener("drop", DND.dragDrop);
      i.addEventListener("dragleave", DND.dragLeave);
      i.addEventListener("dragend", DND.dragEnd);
    });
  }

  protected addGlobalEventListener() {
    const addFileBtn = selectDomElement("#add__file") as HTMLElement;
    const addFolderBtn = selectDomElement("#add__folder") as HTMLElement;
    const explorerBtn = selectDomElement("#explorer__icon-file") as HTMLElement;
    const searchBtn = selectDomElement("#explorer__icon-search") as HTMLElement;
    let trashZone = selectDomElement("#trash__zone");
    const collapseFoldersBtn = selectDomElement(
      "#collapse__folders"
    ) as HTMLElement;
    const refreshFolderBtn = selectDomElement(
      "#refresh__folders"
    ) as HTMLElement;
    const explorerContainer = selectDomElement(
      ".explorer__content"
    ) as HTMLElement;

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
    explorerBtn?.addEventListener("click", (e: MouseEvent) => {
      if ((e.currentTarget as HTMLElement)?.classList.contains("active")) {
        explorerContainer?.classList.toggle("d-none");
      } else {
        (e.currentTarget as HTMLElement)?.classList.add("active"); //add active class and show content
        searchBtn?.classList.remove("active"); //remove active class from search
      }
      console.log((e.currentTarget as HTMLElement)?.classList);
    });
    searchBtn?.addEventListener("click", (e: MouseEvent) => {
      explorerBtn?.classList.remove("active"); //remove active class from explorer
      explorerContainer?.classList.add("d-none"); //add display none to explorer
      if ((e.currentTarget as HTMLElement)?.classList.contains("active")) {
      } else {
        (e.currentTarget as HTMLElement)?.classList.add("active"); //add active class and show content
      }
    });
  }

  /**
   * derive the path from current iteration path based on the index of the rootPathName in the splitted array
   * e.g:
   * if path = C:\\Users\\HP\\Documents\\NODEJS PROJECTS\\File system\\myFiles\\allDocs\\nested;
   * then: derivedPath = [allDocs, nested]
   */
  private async addFileToDirectory(directory: IFolder) {
    let selectedFolder = directory.path.split("\\");
    let pathIndex = selectedFolder.indexOf(state.rootDirName);
    let newFilePath = selectedFolder.slice(pathIndex + 1).join("/");
    const res = await req.getFileInDirectory(newFilePath);

    if (res.data.files?.length) {
      //check if folder has files in it and add it to the current iteration(directory)
      // Object.assign({}, directory, { files: res.data.files }); // directory.files = res.data.files(doesn't work in strict mode)
      directory.files = res.data.files;
      let file = new File();

      file.checkForFilesInDirectories(directory);
      // file.addEventListenerToFiles();
      this.addEventListenersToFolders();
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

  protected async handleFolderCreation() {
    try {
      let {
        data: { directories, root_dir },
      } = await req.getDirectories();
      state.rootDirPath = root_dir;
      state.rootDirName = root_dir.split("\\").slice(-1)[0]; //.pop();

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

  protected handleFolderHover(): void {
    let workspaceNameContainer = selectDomElement(
      ".explorer__content-headerNav.workspace .file__name"
    ) as HTMLDivElement;
    let workSpaceNavBtnContainer = selectDomElement(
      ".explorer__content-headerNav.workspace ul"
    ) as HTMLUListElement;

    workspaceNameContainer.textContent = `${state.workspaceName.substring(
      0,
      5
    )}...`;
    workSpaceNavBtnContainer.classList.remove("d-none");
  }

  protected onFolderMouseOut(): void {
    let workspaceNameContainer = selectDomElement(
      ".file__name"
    ) as HTMLDivElement;
    let workSpaceNavBtnContainer = selectDomElement(
      ".explorer__content-headerNav.workspace ul"
    ) as HTMLUListElement;

    workspaceNameContainer.textContent = state.workspaceName;

    workSpaceNavBtnContainer?.classList.add("d-none");
  }
}

// Store.subscribeEvents(
//   (_, changes) => {
//     const keys = Object.keys(changes);
//     // if (keys.includes("filesOnView")) console.log(keys, "changes");
//     console.log(Store.getState.filesOnView, "state");
//     console.log(changes, "state");
//   },
//   ["filesOnView"]
// );
export { File, Folder };
