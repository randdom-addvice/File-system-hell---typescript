import { IFile } from "./interfaces/interface";
enum Keys {
  SELECTED_FILE = "selected_file",
  FILES_ON_VIEW = "files_on_view",
  SEARCH_HISTORY = "search_history",
}

interface IStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export abstract class LocalStorage<T extends string> {
  private readonly storage: IStorage;

  public constructor(getStorage = (): IStorage => window.localStorage) {
    this.storage = getStorage();
  }

  protected get(key: T): string | null {
    return this.storage.getItem(key);
  }

  protected set(key: T, value: string): void {
    this.storage.setItem(key, value);
  }

  protected clearItem(key: T): void {
    this.storage.removeItem(key);
  }

  protected clearItems(keys: T[]): void {
    keys.forEach((key) => this.clearItem(key));
  }
}

export default class UseLocalStorage extends LocalStorage<Keys> {
  private static instance?: UseLocalStorage;

  private constructor() {
    super();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new UseLocalStorage();
    }

    return this.instance;
  }

  public getSelectedFile(): IFile {
    return JSON.parse(this.get(Keys.SELECTED_FILE) || "{}");
  }

  public getFilesOnView(): IFile[] {
    const files = JSON.parse(this.get(Keys.FILES_ON_VIEW) || "{}");
    return Array.isArray(files) ? files : [];
  }

  public getSearchHistory() {
    return this.get(Keys.SELECTED_FILE);
  }

  public setSelectedFile(file: IFile) {
    this.set(Keys.SELECTED_FILE, JSON.stringify(file));
  }

  public setFilesOnView(file: IFile[]) {
    this.set(Keys.FILES_ON_VIEW, JSON.stringify(file));
  }

  public setSearchHistory(keyWords: string[]) {
    this.set(Keys.SEARCH_HISTORY, JSON.stringify(keyWords));
  }

  public clear() {
    this.clearItems([
      Keys.SELECTED_FILE,
      Keys.FILES_ON_VIEW,
      Keys.SEARCH_HISTORY,
    ]);
  }
}
