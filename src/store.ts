import CreateStore from "vanilla-ts-store";
import { FileState, FolderState, IFolder } from "./interfaces/interface";
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
    currentIdTarget: "null",
    isFolderSelected: null,
    workspaceName: "Work space",
    folders: {},
    files: {},
  },
  mutations: {
    setFolders(state, params) {
      state.folders[params.id] = params.dir;
    },
    setFiles(state, params) {
      state.files[params.id] = params.file;
    },
  },
});

export default Store;
