import CreateStore from "vanilla-ts-store";

import { FileState, FolderState, IFile, IFolder } from "./interfaces/interface";
import UseLocalStorage from "./useLocalStorage";

interface StoreInterface {
  folders: FolderState; //{someId: {...IFolder}, someId: {...IFolder}} ( [key: string]: IFolder)
  files: FileState;
  currentIdTarget: string | null;
  isFolderSelected: boolean | null;
  filesOnView: IFile[];
  selectedFile: IFile | null;
}

const LS = UseLocalStorage.getInstance();

const Store = new CreateStore<StoreInterface>({
  state: {
    currentIdTarget: "null",
    isFolderSelected: null,
    folders: {},
    files: {},
    filesOnView: [], //LS.getFilesOnView(),
    selectedFile: LS.getSelectedFile(),
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
    updateFileContent(state, p) {
      state.files[p.id].file_content = p.file_content;
    },
    setFilesOnView(state, files) {
      state.filesOnView = files;
    },
    setFilesOnViewFromLocalStorage(state) {
      state.filesOnView = LS.getFilesOnView();
    },
    addFileToFileOnView(state, file) {
      const foundFile = state.filesOnView.find(
        (f) => f.file_dir === file.file_dir
      );
      if (foundFile) return;
      state.filesOnView.push(file);
    },
    removeFileFromView(state, id) {
      let newState = state.filesOnView.filter((i) => i.file_id !== id);
      state.filesOnView = newState;
    },
    removeAllFileFromView(state) {
      state.filesOnView = [];
    },
    setSelectedFile(state, file) {
      state.selectedFile = file;
    },
  },
  getters: {
    getFilesOnView(state) {
      return state.filesOnView as any;
    },
  },
});

export default Store;
