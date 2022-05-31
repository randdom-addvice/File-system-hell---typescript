import axios, { AxiosResponse } from "axios";
import { IFile, IFolder } from "./interfaces/interface";

const req = axios.create({
  baseURL: "http://localhost:5000/api",
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

interface IApi {
  getDirectories(): Promise<GetDirectoriesResponse>;
  getFileInDirectory(dir: string): Promise<GetFileInDirectoryResponse>;
  getFile(dir: string): Promise<AxiosResponse<IFile>>;
  deleteDirectory(path: string): Promise<AxiosResponse<string>>;
  deleteFile(path: string): Promise<AxiosResponse<string>>;
}

class API implements IApi {
  async getDirectories(): Promise<GetDirectoriesResponse> {
    const res = await req.get(`/directories`);
    return res;
  }

  async getFileInDirectory(
    directory: string
  ): Promise<GetFileInDirectoryResponse> {
    const res = await req.get(`/files/?directory=${directory}`);
    return res;
  }

  async getFile(directory: string): Promise<AxiosResponse<IFile>> {
    const res = await req.get("/files/get-file", {
      params: { directory },
    });
    return res;
  }

  async deleteDirectory(path: string): Promise<AxiosResponse<string>> {
    return await req.delete("/directories/delete", {
      data: { directory: path },
    });
  }
  async deleteFile(path: string): Promise<AxiosResponse<string>> {
    return await req.delete("/files/delete", {
      data: { file_dir: path },
    });
  }
}

export { API };
