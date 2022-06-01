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
  files?: [IFile];
  child?: [IFolder] | [];
}

export interface IFile {
  file_id: string;
  file_dir: string;
  file_type: string;
  file_name: string;
  file_content: any;
}

export interface FolderClass {
  onFolderClick(e: MouseEvent): void;
}

interface SyntheticEvent<T> extends Event {
  /**
   * A reference to the element on which the event listener is registered.
   */
  currentTarget: EventTarget & T & HTMLElement;

  // If you thought this should be `EventTarget & T`, see https://github.com/DefinitelyTyped/DefinitelyTyped/pull/12239
  /**
   * A reference to the element from which the event was originally dispatched.
   * This might be a child element to the element on which the event listener is registered.
   *
   * @see currentTarget
   */
  target: EventTarget;

  // ...
}
