import CreateStore from "vanilla-ts-store";

import { FileState, FolderState, IFolder } from "./interfaces/interface";
interface StoreInterface {
  folders: FolderState; //{someId: {...IFolder}, someId: {...IFolder}} ( [key: string]: IFolder)
  files: FileState;
  currentIdTarget: string | null;
  isFolderSelected: boolean | null;
}

const Store = new CreateStore<StoreInterface>({
  state: {
    currentIdTarget: "null",
    isFolderSelected: null,
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
    setCurrentIdTarget(state, val) {
      state.currentIdTarget = val;
    },
    setIsFolderSelected(state, val) {
      state.isFolderSelected = val;
    },
    deleteFolder(state, id) {
      delete state.folders[id];
    },
    deleteFile(state, id) {
      delete state.files[id];
    },
    updateDirectoryPath(state, p) {
      state.folders[p.id].path = p.path;
    },
    updateFilePath(state, p) {
      state.files[p.id].file_dir = p.path;
    },
  },
});

export default Store;
