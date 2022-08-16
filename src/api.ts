import axios, { AxiosResponse } from "axios";
import { IFile, IFolder } from "./interfaces/interface";

const req = axios.create({
  baseURL: "https://file-system-api-v1.herokuapp.com/api",
  timeout: 0,
  headers: {
    Accept: "application/vnd.GitHub.v3+json",
  },
});

type GetDirectoriesResponse = AxiosResponse<{
  directories: [IFolder];
  root_dir: string;
}>;
type GetFileInDirectoryResponse = AxiosResponse<{
  files: [IFile];
  file_dir?: string;
}>;

interface CreateFile {
  output_dir: string;
  file_name: string;
  file_ext: string;
  content?: string;
}

interface RenameFolder {
  old_file_path: string;
  new_directory_name: string;
}
interface RenameFile {
  old_file_path: string;
  new_file_name: string;
}

interface WriteFile {
  file_dir: string;
  file_content: string;
}

interface IApi {
  getDirectories(): Promise<GetDirectoriesResponse>;
  getFileInDirectory(dir: string): Promise<GetFileInDirectoryResponse>;
  getFile(dir: string): Promise<AxiosResponse<IFile>>;
  deleteDirectory(path: string): Promise<AxiosResponse<string>>;
  deleteFile(path: string): Promise<AxiosResponse<string>>;
  moveDirectory(oldDir: string, newDir: string): Promise<AxiosResponse<string>>;
  moveFile(oldDir: string, newDir: string): Promise<AxiosResponse<string>>;
  createDirectory(
    newDir: string
  ): Promise<AxiosResponse<{ success: boolean; message: string }>>;
  createFile(newFile: CreateFile): Promise<AxiosResponse<string>>;
  renameFolder(body: RenameFolder): Promise<AxiosResponse<string>>;
  renameFile(body: RenameFile): Promise<AxiosResponse<string>>;
  writeFile(body: WriteFile): Promise<AxiosResponse<string>>;
}

class API implements IApi {
  public async getDirectories(): Promise<GetDirectoriesResponse> {
    const res = await req.get(`/directories`);
    return res;
  }

  public async getFileInDirectory(
    directory: string
  ): Promise<GetFileInDirectoryResponse> {
    const res = await req.get(`/files/?directory=${directory}`);
    return res;
  }

  public async getFile(directory: string): Promise<AxiosResponse<IFile>> {
    const res = await req.get("/files/get-file", {
      params: { directory },
    });
    return res;
  }

  public async deleteDirectory(path: string): Promise<AxiosResponse<string>> {
    return await req.delete("/directories/delete", {
      data: { directory: path },
    });
  }

  public async deleteFile(path: string): Promise<AxiosResponse<string>> {
    return await req.delete("/files/delete", {
      data: { file_dir: path },
    });
  }

  public async moveDirectory(
    oldDir: string,
    newDir: string
  ): Promise<AxiosResponse<string>> {
    return await req.post("/directories/move", {
      old_dir: oldDir,
      new_dir: newDir,
    });
  }

  public async moveFile(
    oldDir: string,
    newDir: string
  ): Promise<AxiosResponse<string>> {
    return await req.post("/files/move", {
      old_dir: oldDir,
      new_dir: newDir,
    });
  }

  public async createDirectory(
    newDir: string
  ): Promise<AxiosResponse<{ success: boolean; message: string }>> {
    return req.post("/directories/create", {
      new_directory: newDir,
    });
  }

  public async createFile(newFile: CreateFile): Promise<AxiosResponse<string>> {
    return req.post("/files/create", { ...newFile });
  }

  public async renameFolder(
    body: RenameFolder
  ): Promise<AxiosResponse<string>> {
    return req.patch("/directories/rename", { ...body });
  }

  public async renameFile(body: RenameFile): Promise<AxiosResponse<string>> {
    return req.patch("/files/rename", { ...body });
  }

  public async writeFile(body: WriteFile): Promise<AxiosResponse<string>> {
    return req.patch("/files/write", { ...body });
  }
}

export { API };
