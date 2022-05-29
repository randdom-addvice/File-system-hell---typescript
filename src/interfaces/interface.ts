import { AxiosResponse } from "axios";

interface IObjectKeys {
  [key: string]: string | number | undefined;
}

export interface FolderState {
  [key: string]: IFolder;
}
export interface FileState {
  [key: string]: IFile;
}

export interface IFolder {
  id: string;
  path: string;
  name: string;
  files: [IFile];
  child?: [IFolder];
}

export interface IFile {
  file_id: string;
  file_dir: string;
  file_type: string;
  file_name: string;
  file_content: any;
}
