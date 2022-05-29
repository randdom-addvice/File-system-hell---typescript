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

class API {
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
}

export { API };
