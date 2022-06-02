import { API } from "./api";
import { unmountComponent } from "./components";
import { FileState, FolderState } from "./interfaces/interface";
import { selectDomElement } from "./utils";

interface DnDClass {
  files: FileState;
  folders: FolderState;
  trashZone: string | null;
  selectedId: string | null;
  dropZoneId: string | null;
  type: string;
}
const req = new API();
class DnD {
  private files: FileState;
  private folders: FolderState;
  private trashZone: HTMLDivElement | null;
  private selectedId: string | null;
  private dropZoneId: string | null;
  private type: string;
  // private setCurrentIdTarget: string;

  public constructor(
    folders: FolderState,
    files: FileState
    // setCurrentIdTarget: string
  ) {
    // super();
    this.files = files;
    this.folders = folders;
    // this.setCurrentIdTarget = setCurrentIdTarget;
    this.trashZone = null;
    this.selectedId = null;
    this.dropZoneId = null;
    this.type = "";
    let methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
    methods
      .filter((method) => method !== "constructor")
      .forEach((method: string) => {
        //this[method as keyof typeof this] = this
        let _this: { [key: string]: any } = this;
        _this[method] = _this[method].bind(this);
      });
  }

  public drag(e: DragEvent): void {
    e.stopPropagation();
    const trashZone = <HTMLDivElement>document.getElementById("trash__zone");
    let currentTarget = <HTMLElement>e.currentTarget;
    this.trashZone = trashZone;
    this.type = currentTarget.dataset.type as string;
    this.trashZone.classList.add("delete__zone--over");
    this.selectedId =
      currentTarget.dataset.folder_id! || currentTarget.dataset.file_id!; //set the id of the selected folder or file to be used for further operation
  }

  public dragLeave(e: any): void {
    e.stopPropagation();
    e.currentTarget.classList.remove("explorer__content-folder--over");
  }

  public dragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).classList.add(
      "explorer__content-folder--over"
    );
  }

  public async dragDrop(e: DragEvent): Promise<void> {
    e.preventDefault();
    e.stopPropagation();
    const folderMoved: boolean = this.type === "folder";
    let currentTarget = e.currentTarget as HTMLElement;
    let fileName: string;
    let oldDir: string;
    let newDir: string;
    currentTarget.classList.remove("explorer__content-folder--over");

    if (currentTarget.classList.contains("explorer__content-file"))
      currentTarget = currentTarget.parentElement as HTMLElement; //check if a file is dropped on a file rather than a folder and set the current target to it's nearest parent
    this.dropZoneId =
      currentTarget.dataset.folder_id || currentTarget.dataset.file_id!;
    if (this.dropZoneId === this.selectedId) return; //prevent further execution if dragged item id in the same folder as the drop zone

    if (folderMoved) {
      oldDir = this.folders[this.selectedId!].path; //source
      newDir = this.folders[this.dropZoneId].path; //target
      const newDirPathName: string = this.folders[this.selectedId!].name;
      await req.moveDirectory(oldDir, newDir);
      this.swap();
      this.folders[this.selectedId!].path = `${newDir}\\${newDirPathName}`; //update the new path of the file moved
    } else {
      fileName = this.files[this.selectedId!].file_name;
      oldDir = this.files[this.selectedId!].file_dir;
      newDir = `${this.folders[this.dropZoneId].path}\\${fileName}`;
      await req.moveFile(oldDir, newDir);
      this.swap();
      this.files[this.selectedId!].file_dir = newDir;
    }
  }

  private swap(): void {
    const from = selectDomElement(`[id='${this.selectedId}']`) as HTMLElement;
    const to = selectDomElement(`[id='${this.dropZoneId}']`) as HTMLElement;
    from.classList.add("nested");

    if (from.contains(to)) return; //prevent parent folder getting moved into subfolder
    if (!to.classList.contains("explorer__content-folder--collapsed"))
      from.classList.add("d-none"); //add a display none style to moved element if parent element is collapsed
    if (to.classList.contains("explorer__content-file")) {
      from.classList.remove("d-none");
      to.parentElement?.appendChild(from); //add to the parent element(folder) instead, when folder or file is dropped on a file
      return;
    }
    to.appendChild(from);
  }

  public dragEnd(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.trashZone?.classList.remove("delete__zone--over");
  }

  //trashZone
  public trashZoneDragOver(e: DragEvent): void {
    e.preventDefault();
    this.trashZone?.classList.add("delete__zone--over--dashed");
  }

  public async dropInTrash(e: DragEvent): Promise<void> {
    e.stopPropagation();
    try {
      this.trashZone?.classList.remove("delete__zone--over--dashed");
      if (this.type === "folder") {
        await req.deleteDirectory(this.folders[this.selectedId!].path);
        delete this.folders[this.selectedId!];
      } else {
        await req.deleteFile(this.files[this.selectedId!].file_dir);
        delete this.files[this.selectedId!];
      }
      unmountComponent(this.selectedId!);
      // this.setCurrentIdTarget = "folder-container";
      this.trashZone?.classList.remove("delete__zone--over");
    } catch (error) {
      alert("OOPS! an error occurred");
    }
    e.preventDefault();
  }
}

export { DnD as default };
