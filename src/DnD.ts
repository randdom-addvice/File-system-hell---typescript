import { API } from "./api";
import { FileState, FolderState } from "./interfaces/interface";

interface DnDClass {
  files: FileState;
  folders: FolderState;
  trashZone: string | null;
  selectedId: string | null;
  dropZoneId: string | null;
  type: string;
}

class DnD {
  private files: FileState;
  private folders: FolderState;
  private trashZone: HTMLDivElement | null;
  private selectedId: string | null;
  private dropZoneId: string | null;
  private type: string;

  constructor(folders: FolderState, files: FileState) {
    // super();
    this.files = files;
    this.folders = folders;
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

  drag(e: DragEvent) {
    e.stopPropagation();
    const trashZone = <HTMLDivElement>document.getElementById("trash__zone");
    let currentTarget = <HTMLElement>e.currentTarget;
    this.trashZone = trashZone;
    this.type = currentTarget.dataset.type as string;
    this.trashZone.classList.add("delete__zone--over");
    this.selectedId =
      currentTarget.dataset.folder_id ||
      (currentTarget.dataset.file_id as string | null);
  }

  dragLeave(e: any) {
    e.stopPropagation();
    // e.currentTarget.classList.remove("explorer__content-folder--over");
  }

  dragOver(e: any) {
    e.preventDefault();
    e.stopPropagation();
    // console.log("Event: ", "dragover");
    // e.currentTarget.classList.add("explorer__content-folder--over");
  }

  dragDrop(e: any) {
    e.preventDefault();
    e.stopPropagation();
  }

  dragEnd(e: any) {}

  //trashZone
  trashZoneDragOver(e: DragEvent) {
    e.preventDefault();
    this.trashZone?.classList.add("delete__zone--over--dashed");
  }

  dropInTrash(e: DragEvent) {
    e.stopPropagation();
    this.trashZone?.classList.remove("delete__zone--over--dashed");
    console.log(this.files);
    // console.log(this.folders);
  }
}

export { DnD as default };
