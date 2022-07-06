import uid from "shortid";
import { API } from "./api";
import DragNDrop from "./DnD";
import CodeMirror from "codemirror/lib/codemirror.js";
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
  DialogModal,
  DropDownContext,
  FileBlock,
  FileView,
  FolderBlock,
  OpenEditorFile,
  renderComponent,
  renderIcon,
  SearchResult,
  TextField,
  TextFieldErrorMessage,
  unmountComponent,
} from "./components";
import {
  attachEvent,
  deleteDomElement,
  selectDomElement,
  selectDomElements,
} from "./utils";
import { AxiosError } from "axios";
import CodeMirrorManager from "./cm";
import UseLocalStorage from "./useLocalStorage";
const req = new API();
const DND = new DragNDrop();
const CM = new CodeMirrorManager();
const LS = UseLocalStorage.getInstance();

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
    const isExist = LS.getFilesOnView().find(
      (i) => i.file_dir === file.file_dir
    );
    if (!file || isExist) return; //if file do not exist or already on view
    this.addFileToFileOnView(state.currentIdTarget, file);
    this.addFileToOpenEditors(state.currentIdTarget, file);

    Store.commit("addFileToFileOnView", file);
    Store.commit("setSelectedFile", file);
    //create a new DOM element to inject CodeMirror into
    const fileEditorContainer = document.getElementById(
      "file__content"
    ) as HTMLElement;
    const editorHTML = `<div data-editor_cm_id=${file.file_id} id="cm-${file.file_id}" class="tab-pane d-none"></div>`;
    fileEditorContainer.innerHTML += editorHTML;
    CM.injectCM(file);
    this.viewFile(file);
    let folder = new Folder();
    if (e.button === 2) {
      state.isFolderSelected = false; //currentTarget.dataset.type === "folder"; //set the "isFolderSelected" property on the Folder class to be used in the "deleteFolderOrFile method"
      folder.showDropDownContext(currentTarget.dataset.file_id!);
    }
  }

  public viewFile(file: IFile): void {
    Store.commit("setSelectedFile", file);
    LS.setSelectedFile(file);
    LS.setFilesOnView(Store.getState.filesOnView);
    this.showEditor(file.file_id);
  }

  public addFileToFileOnView(id: string, file: IFile): void {
    const container = selectDomElement("#explorer__view-header-group");
    const isExist = LS.getFilesOnView().find((i) => i.file_id === id);
    if (isExist) return;
    container?.appendChild(
      FileView({
        name: file.file_name,
        id: file.file_id,
        saved: !!file?.modified,
        ext: file.file_type,
        remove: (e: MouseEvent) => {
          e.stopPropagation();
          this.removeFileFromOnView(file.file_id);
        },
        viewFile: () => this.viewFile(file),
      })
    );
  }

  public addFileToOpenEditors(id: string, file: IFile): void {
    const container = selectDomElement("#editors-container");
    const isExist = Store.getState.filesOnView.find((i) => i.file_id === id);
    if (isExist) return;
    container?.appendChild(
      OpenEditorFile({
        name: file.file_name,
        id: file.file_id,
        saved: !!file?.modified,
        ext: file.file_type,
        remove: (e: MouseEvent) => {
          e.stopPropagation();
          this.removeFileFromOnView(file.file_id);
        },
        viewFile: () => this.viewFile(file),
      })
    );
  }

  private removeFile(id: string): void {
    const fileOnView = selectDomElement(`[data-file_view_id='${id}']`);
    const fileInEditor = selectDomElement(`[data-editor_file_id='${id}']`);
    const editor = selectDomElement(`#cm-${id}`);
    fileOnView?.remove();
    fileInEditor?.remove();
    LS.setSelectedFile(null);
    LS.setFilesOnView(
      Store.getState.filesOnView.filter((i) => i.file_id !== id)
    );
    Store.commit("setFilesOnView", LS.getFilesOnView());
    editor?.remove();
    const nextFile = LS.getFilesOnView()[LS.getFilesOnView().length - 1];
    if (nextFile) {
      Store.commit("setSelectedFile", nextFile);
      LS.setSelectedFile(nextFile);
      this.viewFile(nextFile);
      // CM.injectFileContent();
      return;
    }
  }

  private removeFileFromOnView(id: string) {
    const currFileView = LS.getSelectedFile();
    const selectedFile = LS.getFilesOnView().find((i) => i.file_id === id);
    if (selectedFile?.modified) {
      if (!selectedFile) return;
      this.viewFile(selectedFile); //display the file to be removed on order for CM to read it's content
      renderComponent(
        DialogModal({
          message: `Do you want to save the changes you made to ${selectedFile?.file_name} ?`,
        }),
        "modal",
        () => {
          const save = selectDomElement("#dialog__save") as HTMLButtonElement;
          const ignore = selectDomElement(
            "#dialog__ignore__save"
          ) as HTMLButtonElement;
          selectDomElements(".close__dialog")?.forEach(
            (i) => (i.onclick = this.closeDialogModal)
          );
          save.onclick = () => {
            this.saveFileChanges(selectedFile);
            this.closeDialogModal();
            this.removeFile(id);
          };
          ignore.onclick = () => {
            this.closeDialogModal();
            this.removeFile(id);
          };
        }
      );
      return;
    }
    // Store.commit("removeFileFromView", id);
    this.removeFile(id);
  }

  private closeDialogModal(): void {
    selectDomElement("#dialog__modal")?.remove();
  }

  public async saveFileChanges(file: IFile): Promise<void> {
    try {
      const f = Object.values(Store.getState.files).find(
        (i) => i.file_dir === file.file_dir
      ); //use this to get the correct file based on the file path as the file changes on page reload
      if (!CM.getCM) return;
      let doc = "";
      CM.getCM[file.file_id].getDoc().children.map((i: any) => {
        i.lines
          .map((l: any) => l.text)
          .forEach((x: any) => {
            doc += x;
            doc += "\n";
          });
        return doc;
      });
      await req.writeFile({
        file_dir: file.file_dir,
        file_content: doc,
      });
      Store.commit("updateFileContent", {
        id: f?.file_id,
        file_content: doc,
      });
      const updatedFile = { ...file, file_content: doc };
      LS.setSelectedFile(updatedFile);
      CM.updateFileOnType(false, updatedFile);
    } catch (error) {
      console.log(error);
      alert("OOps an error occurred");
    }
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
      i.modified = false;
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

  private showEditor(id: string) {
    const currentTarget = selectDomElement(`[data-file_view_id='${id}']`);
    const editorTabHeaders = selectDomElements(".tab-links");
    const editorTabFiles = selectDomElements(".tab-pane");
    editorTabHeaders?.forEach((i) =>
      i.classList.remove("explorer__view-header-files--active")
    );
    editorTabFiles?.forEach((i) => i.classList.add("d-none"));
    selectDomElement(`#cm-${id}`)?.classList.remove("d-none");
    currentTarget?.classList.add("explorer__view-header-files--active");
    CM.getCM[id]?.refresh();
  }

  public initEditor(): void {
    const file = new File();
    const filesOnView = Store.getState.filesOnView;
    const currFile = Store.getState.selectedFile || filesOnView[0];
    if (filesOnView.length) {
      filesOnView.forEach((i) => {
        const fileEditorContainer = document.getElementById(
          "file__content"
        ) as HTMLElement;
        const editorHTML = `<div data-editor_cm_id=${i.file_id} id="cm-${i.file_id}" class="tab-pane d-none"></div>`;
        fileEditorContainer.innerHTML += editorHTML;
        file.addFileToFileOnView("", i);
        file.addFileToOpenEditors("", i);
      });
      CM.injectFileContent(filesOnView);
    }
    if (currFile) this.showEditor(currFile.file_id);
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

  public addEventListenersToFolders() {
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

  public addGlobalEventListener() {
    const searchService = new SearchService();
    const addFileBtn = selectDomElement("#add__file");
    const addFolderBtn = selectDomElement("#add__folder");
    const explorerBtn = selectDomElement("#explorer__icon-file");
    const searchBtn = selectDomElement("#explorer__icon-search");
    let trashZone = selectDomElement("#trash__zone");
    const collapseFoldersBtn = selectDomElement("#collapse__folders");
    const refreshFolderBtn = selectDomElement("#refresh__folders");
    const explorerContainer = selectDomElement(".explorer__content");
    const searchContainer = selectDomElement("#search__container");

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
    collapseFoldersBtn?.addEventListener("click", () => {
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
      const currentTarget = e.currentTarget as HTMLElement;
      searchContainer?.classList.add("d-none");
      explorerContainer?.classList.remove("d-none");
      if (currentTarget?.classList.contains("active")) {
        explorerContainer?.classList.add("d-none");
        currentTarget.classList.remove("active");
      } else {
        currentTarget?.classList.add("active"); //add active class and show content
        searchBtn?.classList.remove("active"); //remove active class from search
      }
    });
    searchBtn?.addEventListener("click", (e: MouseEvent) => {
      const currentTarget = e.currentTarget as HTMLElement;
      explorerContainer?.classList.add("d-none"); //add display none to explorer
      searchContainer?.classList.remove("d-none");
      if (currentTarget?.classList.contains("active")) {
        searchContainer?.classList.add("d-none");
        currentTarget.classList.remove("active");
      } else {
        currentTarget?.classList.add("active"); //add active class and show content
        explorerBtn?.classList.remove("active");
      }
    });
    searchService.addListeners();
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

  public async handleFolderCreation() {
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

class SearchService extends File {
  private readonly noResultMsg: string =
    "No results found. Review your match cases and check your keywords";
  private readonly errorMsg: string = " Invalid regular expression";
  private searchValue: string = "";
  private replaceValue: string = "";
  private filesToInclude: string = "";
  private filesToExclude: string = "";
  private matchCase: boolean = false;
  private matchWholeWord: boolean = false;
  private useRegex: boolean = false;
  private matchedFiles: IFile[] = [];
  private readonly searchHistory: string[] = LS.getSearchHistory();
  private searchHistoryIndex: number = -1;
  private readonly navButtons: (HTMLElement | null)[] = [
    selectDomElement("#refresh__search"),
    selectDomElement("#clear__search"),
    selectDomElement("#collapse__search__results"),
    selectDomElement("#replace__all"),
  ];
  private readonly messageContainer: HTMLElement = selectDomElement(
    "#message"
  ) as HTMLElement;
  private searchResultContainer = selectDomElement(
    "#search-result-container"
  ) as HTMLElement;

  public constructor() {
    super();
    let methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    //bind all methods
    methods
      .filter((method) => method !== "constructor")
      .forEach((method: string) => {
        let _this: { [key: string]: any } = this;
        _this[method] = _this[method].bind(this);
      });
  }

  private searchFiles(): void {
    this.searchResultContainer.innerHTML = "";
    const { files } = Store.getState;
    const includedFiles = Object.values(files)
      .filter((i) => {
        const byExtension = this.filesToInclude.charAt(0) === ".";
        return byExtension
          ? i.file_type === this.filesToInclude
          : i.file_name === this.filesToInclude ||
              i.file_dir
                .toLowerCase()
                .includes(this.filesToInclude.toLowerCase());
      })
      .filter((i) => {
        const byExtension = this.filesToExclude.charAt(0) === ".";
        return byExtension
          ? i.file_type !== this.filesToExclude
          : i.file_name !== this.filesToExclude ||
              !i.file_dir
                .toLowerCase()
                .includes(this.filesToExclude.toLowerCase());
      }); //filter all files by the files to include or exclude

    const caseSensitive = includedFiles
      .map((i) => i.file_content)
      .map((x) => {
        if (this.searchValue.length === 0) return;
        return !this.matchCase
          ? x.toLowerCase().indexOf(this.searchValue.toLowerCase())
          : x.indexOf(this.searchValue);
      });
    const matchWholeWord = includedFiles
      .map((i) => i.file_content)
      .map((i) => {
        let value = this.matchCase
          ? this.searchValue
          : this.searchValue.toLowerCase();
        if (value.length === 0) return;
        function isMatch(searchOnString: string, searchText: string) {
          searchText = searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
          return (
            searchOnString.match(new RegExp("\\b" + searchText + "\\b")) != null
          );
        }
        return isMatch(i.replace(/["']/g, ""), value);
      }); //returns true if no match // if (ab is clicked) ^
    if (this.matchWholeWord) {
      let matchedFiles = matchWholeWord
        .map((i, index) => {
          if (i === true) return Object.values(files)[index];
        })
        .filter((i) => i !== undefined) as IFile[] | [];
      this.matchedFiles = matchedFiles;
    } else {
      const indexes = caseSensitive.filter((i) => i !== -1 && i !== undefined);
      const matchedFiles = indexes.map((index) => {
        const foundIndex = caseSensitive.findIndex((i) => i === index);
        return includedFiles[foundIndex];
      });
      this.matchedFiles = matchedFiles;
    }
    if (this.useRegex) {
      try {
        const regex = includedFiles
          .map((i) => i.file_content)
          .filter((x) => x.search(this.searchValue))
          .filter((i) => i !== ""); //if (* is clicked)
        this.matchedFiles = regex;
      } catch (error) {
        this.messageContainer.textContent = this.errorMsg;
        return;
      }
    }
    const message: string = this.matchedFiles.length ? "" : this.noResultMsg;
    const matchedLines: { file: IFile; lines: string[] }[] = [];
    this.messageContainer.textContent = message;
    this.matchedFiles.forEach((i, index, array) => {
      const lines = i.file_content.split("\n");
      let t: string[] = [];
      lines.forEach((x: string) => {
        if (x.includes(this.searchValue)) t.push(x);
      });
      matchedLines.push({ file: array[index], lines: t });
    });
    matchedLines.forEach((i) => {
      this.searchResultContainer.appendChild(
        SearchResult({
          ext: i.file.file_type,
          name: i.file.file_name,
          count: i.lines.length,
          searchText: this.searchValue,
          searchResult: i.lines,
          id: i.file.file_id,
          handleClick: (e: MouseEvent): void => {
            const currentTarget = e.currentTarget as HTMLElement;
            const children = Array.from(currentTarget.children).filter((x) =>
              x.classList.contains("search__result-text")
            );
            let fileIcon = selectDomElement(
              `[data-search_id='${i.file.file_id}'] .search__result-arrow i`
            ) as HTMLElement;
            fileIcon?.classList.toggle("fa-rotate-90");
            children.forEach((child) => {
              child.classList.toggle("search__result-text--hide");
            });
          },
          handleDelete: (e: MouseEvent) => {
            e.stopPropagation();
            selectDomElement(`[data-search_id='${i.file.file_id}']`)?.remove();
            console.log("deleted", i.file.file_id);
          },
          handleResultDelete: (e: MouseEvent) => {
            e.stopPropagation();
            selectDomElement(
              `[data-search_result_id='${i.file.file_id}']`
            )?.remove();
            console.log("deleted", i.file.file_id);
          },
          viewFile: (e: MouseEvent) => {
            e.stopPropagation();
            this.viewFile(i.file);
          },
        })
      );
    });
  }

  // Listeners
  private refresh(): void {
    this.searchFiles();
  }

  private clearSearch(): void {
    this.searchValue = "";
    this.replaceValue = "";
    this.messageContainer.textContent = "";
    this.searchResultContainer.innerHTML = "";
    [
      selectDomElement("#search__input"),
      selectDomElement("#replace__input"),
      selectDomElement("#to__include"),
      selectDomElement("#to__exclude"),
    ].forEach((i) => ((i as HTMLInputElement).value = ""));
  }

  private openNewSearchEditor(): void {
    console.log("open new search editor clicked");
  }

  private collapseAll(): void {
    const searchResults = Array.from(
      document.querySelectorAll(".search__result-text")
    );
    const icons = Array.from(
      document.querySelectorAll(".search__result-wrapper i")
    );
    searchResults.forEach((i) => {
      i.classList.add("search__result-text--hide");
    });
    icons.forEach((i) => {
      i.classList.remove("fa-rotate-90");
    });
  }

  private onSearchKeyUp(event: KeyboardEvent): void {
    this.searchValue = (event.target as HTMLInputElement).value;
    if (["ArrowUp", "ArrowDown"].includes(event.key || event.code)) {
      if (event.key === "ArrowUp" || event.code === "ArrowUp") {
        this.searchHistoryIndex === this.searchHistory.length - 1
          ? (this.searchHistoryIndex = 0)
          : this.searchHistoryIndex++;
      }
      if (event.key === "ArrowDown" || event.code === "ArrowDown") {
        this.searchHistoryIndex <= 0
          ? (this.searchHistoryIndex = 0)
          : this.searchHistoryIndex--;
      }
      const history = this.searchHistory[this.searchHistoryIndex] || "";
      this.searchValue = history;
      (selectDomElement("#search__input") as HTMLInputElement).value = history;
    }
    this.navButtons.forEach(
      (i) =>
        ((i as HTMLButtonElement).disabled =
          this.searchValue.length > 0 ? false : true)
    ); //disable or enable nav buttons based on serahkeyword length

    this.searchFiles();
  }

  private onReplaceKeyUp(event: KeyboardEvent): void {
    this.replaceValue = (event.target as HTMLInputElement).value;
  }

  private onSearchInputBlur(): void {
    if (this.searchValue) LS.setSearchHistory(this.searchValue);
  }

  private matchCaseOnSearch(): void {
    const matchCaseBtn = selectDomElement("#match__case");
    const searchInput = selectDomElement("#search__input");
    this.matchCase = !this.matchCase;
    matchCaseBtn?.classList.toggle("--active");
    searchInput?.focus();
  }

  private matchWholeWordOnSearch(): void {
    const matchWholeWordBtn = selectDomElement("#match__whole__word");
    const searchInput = selectDomElement("#search__input");
    this.matchWholeWord = !this.matchWholeWord;
    matchWholeWordBtn?.classList.toggle("--active");
    searchInput?.focus();
    console.log("match whole word clicked");
  }

  private useRegularExpressionOnSearch(): void {
    const matchRegexBtn = selectDomElement("#regex");
    const searchInput = selectDomElement("#search__input");
    this.useRegex = !this.useRegex;
    matchRegexBtn?.classList.toggle("--active");
    searchInput?.focus();
    console.log("use regular expression on search clicked");
  }

  private replaceAll(): void {
    const matchedFiles = this.matchedFiles;
    const updated = matchedFiles.map((i) => {
      i.file_content = i.file_content.replaceAll(
        this.searchValue,
        this.replaceValue
      );
      return i;
    });
    const currentFileView = Store.getState.selectedFile;
    const currUpdatedFile = updated.find(
      (i) => i.file_dir === currentFileView?.file_dir
    );
    this.matchedFiles = updated;
    if (currUpdatedFile) this.viewFile(currUpdatedFile);
    this.searchFiles();
    console.log("currUpdatedFile ==>", currUpdatedFile);
    console.log("currentFileView ==>", currentFileView);
    console.log("updated ==>", updated);
  }

  private toggleSearchDetail(): void {
    console.log("toggle search detail clicked");
  }

  private toggleReplace(): void {
    console.log("toggle replace clicked");
  }

  private toggleArrow(): void {
    const arrow = selectDomElement("#search__inputs__arrow i");
    const wrapper = selectDomElement(".search__inputs-input .wrapper.replace");
    arrow?.classList.toggle("fa-rotate-90");
    wrapper?.classList.toggle("d-none");
  }
  private toggleFilesToInclude(): void {
    const wrapper = selectDomElement(".search__inputs-input .toggled-inputs");
    wrapper?.classList.toggle("d-none");
  }

  public addListeners(): void {
    const refreshSearch = selectDomElement("#refresh__search");
    const clearSearch = selectDomElement("#clear__search");
    const openSearchEditor = selectDomElement("#open__search__editor");
    const collapseSearchResults = selectDomElement(
      "#collapse__search__results"
    );
    const searchInputArrow = selectDomElement("#search__inputs__arrow");
    const searchInput = selectDomElement("#search__input");
    const replaceInput = selectDomElement("#replace__input");
    const matchCaseBtn = selectDomElement("#match__case");
    const matchWholeWordBtn = selectDomElement("#match__whole__word");
    const matchRegexBtn = selectDomElement("#regex");
    const replaceAllBtn = selectDomElement("#replace__all");
    const toggleSearchDetailsBtn = selectDomElement("#toggle__search__details");
    const filesToIncludeInput = selectDomElement("#to__include");
    const filesToExcludeInput = selectDomElement("#to__exclude");

    refreshSearch?.addEventListener("click", this.refresh);
    clearSearch?.addEventListener("click", this.clearSearch);
    openSearchEditor?.addEventListener("click", this.openNewSearchEditor);
    collapseSearchResults?.addEventListener("click", this.collapseAll);
    searchInputArrow?.addEventListener("click", this.toggleArrow);
    searchInput?.addEventListener("keyup", this.onSearchKeyUp);
    searchInput?.addEventListener("blur", this.onSearchInputBlur);
    replaceInput?.addEventListener("keyup", this.onReplaceKeyUp);
    matchCaseBtn?.addEventListener("click", this.matchCaseOnSearch);
    matchWholeWordBtn?.addEventListener("click", this.matchWholeWordOnSearch);
    matchRegexBtn?.addEventListener("click", this.useRegularExpressionOnSearch);
    replaceAllBtn?.addEventListener("click", this.replaceAll);
    toggleSearchDetailsBtn?.addEventListener(
      "click",
      this.toggleFilesToInclude
    );
    filesToIncludeInput?.addEventListener("change", (event: Event) => {
      this.filesToInclude = (event.target as HTMLInputElement).value;
    });
    filesToExcludeInput?.addEventListener("change", (event: Event) => {
      this.filesToExclude = (event.target as HTMLInputElement).value;
    });
  }
}

CodeMirror.commands.save = () => {
  const file = new File();
  const f = LS.getSelectedFile();
  file.saveFileChanges(f);
  CM.updateFileOnType(false, f);
};

export { File, Folder };
