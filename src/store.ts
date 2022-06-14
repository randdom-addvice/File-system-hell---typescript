import CreateStore from "vanilla-ts-store";
import { FileState, FolderState } from "./interfaces/interface";

interface StoreInterface {
  rootDirPath: string;
  rootDirName: string;
  folders: FolderState; //{someId: {...IFolder}, someId: {...IFolder}} ( [key: string]: IFolder)
  workspaceName: string;
  files: FileState;
  currentIdTarget: string | null;
  isFolderSelected: boolean | null;
}

const Store = new CreateStore<StoreInterface>({
  state: {
    rootDirPath: "",
    rootDirName: "",
    currentIdTarget: null,
    isFolderSelected: null,
    workspaceName: "Work space",
    folders: {},
    files: {},
  },
});

export default Store;
