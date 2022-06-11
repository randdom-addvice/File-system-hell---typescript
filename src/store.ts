import DragonBinder from "dragonbinder";
import {
  FileState,
  FolderClass,
  FolderState,
  IFile,
  IFolder,
} from "./interfaces/interface";

interface GlobalState {
  rootDirPath: string;
  rootDirName: string;
  folders: FolderState; //{someId: {...IFolder}, someId: {...IFolder}} ( [key: string]: IFolder)
  workspaceName: string;
  files: FileState;
  currentIdTarget: string | null;
  isFolderSelected: boolean | null;
  count: number;
}
const state: GlobalState = {
  count: 0,
  rootDirPath: "",
  rootDirName: "",
  currentIdTarget: null,
  isFolderSelected: null,
  workspaceName: "Work space",
  folders: {},
  files: {},
};

const store = new DragonBinder({
  state: {
    ...state,
  },
  mutations: {
    setFolders(state: GlobalState, payload: { id: string; folder: IFolder }) {
      state.folders = { ...state.folders, [payload.id]: payload.folder };
      //   console.log(payload.id);
    },
    increment(state: GlobalState) {
      state.count++;
    },
  },
});

store.commit("increment");
// console.log(store.state);
export default store;
