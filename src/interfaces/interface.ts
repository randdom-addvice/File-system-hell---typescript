import { AxiosResponse } from "axios";

interface IObjectKeys {
  [key: string]: string | number | [IFile] | [IFolder] | undefined;
}

export interface IFolder extends IObjectKeys {
  id: string;
  path: string;
  name: string;
  files: [IFile];
  child?: [IFolder];
}

export interface IFile {
  file_dir: string;
  file_ext: string;
  file_name: string;
  file_content: any;
}
