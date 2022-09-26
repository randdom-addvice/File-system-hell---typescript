import { AxiosResponse } from "axios";

interface IObjectKeys {
  [key: string]: any;
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
  files?: [IFile];
  child?: [IFolder] | [];
}

export interface IFile extends IFileDetails {
  file_id: string;
  file_dir: string;
  file_type: string;
  file_name: string;
  file_content: any;
}

export interface Storage extends IObjectKeys {
  currentFileView: IFile;
  searchHistory: string[];
  filesOnView: IFile[];
  searchKeyWord: string;
}

export interface FolderClass {
  onFolderClick(e: MouseEvent): void;
}
export interface IFileDetails {
  modified?: boolean;
}

export interface FileModule {
  handleFileClick(e: MouseEvent): void;
  viewFile(file: IFile): void;
  addFileToFileOnView(id: string, file: IFile): void;
  addFileToOpenEditors(id: string, file: IFile): void;
  removeFileFromOnView(id: string): void;
  addEventListenerToFiles(): void;
  checkForFilesInDirectories(folder: IFolder): void;
  updateFileOnType(value: boolean): void;
}

interface SyntheticEvent<T> extends Event {
  /**
   * A reference to the element on which the event listener is registered.
   */
  currentTarget: EventTarget & T & HTMLElement;

  /**
   * A reference to the element from which the event was originally dispatched.
   * This might be a child element to the element on which the event listener is registered.
   *
   * @see currentTarget
   */
  target: EventTarget;

  // ...
}
