import {
  createFile,
  deleteFileFromDirectory,
  getDir,
  moveFile,
  readAllDir,
  readFileContent,
  renameFile,
  writeToFile,
} from "../services/file-services.js";
import path from "path";
import { ErrorResponse, handleError } from "../utils/errorResponse.js";
import {
  checkDirectoryExists,
  createDirectory,
} from "../services/directory-services.js";

import { baseDirectory, __dirname } from "../utils/constants.js";
let baseDir = "./myFiles";

export async function getFile(req, res) {
  try {
    // const fileDir = getDir(req.query.dir);
    const { content, fileName, fileType } = readFileContent(
      req.query.directory
    );

    res.status(200).json({
      file_content: content,
      file_type: fileType,
      file_name: fileName,
      file_dir: req.query.dir,
    });
  } catch (error) {
    handleError(error, res);
  }
}

export async function getAllFiles(req, res) {
  try {
    const fileDir = getDir(`${baseDirectory}/${req.query.directory}`);
    if (!checkDirectoryExists(fileDir))
      throw new ErrorResponse("No such directory", 401);
    const files = readAllDir(fileDir);

    const fileContent = [];

    files.forEach((i) => {
      const { content, fileName, fileType } = readFileContent(
        fileDir + "\\" + i.name
      );
      fileContent.push({
        file_type: fileType,
        file_name: fileName,
        file_dir: `${fileDir}/${i.name}`,
        file_content: content,
      });
    });
    res.status(200).json({
      files: fileContent,
      file_dir: fileDir,
    });
  } catch (error) {
    handleError(error, res);
  }
}

export async function createFileController(req, res) {
  try {
    const { output_dir, file_name, file_ext, content } = req.body;
    let OUTPUT_DIR = path.resolve(baseDirectory, output_dir);
    let OUTPUT_PATH = path.join(OUTPUT_DIR, `${file_name}${file_ext}`);
    if (!checkDirectoryExists(OUTPUT_DIR)) createDirectory(OUTPUT_DIR); //if the directory doesn't exist, create new

    let data = createFile(OUTPUT_PATH, content);
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleError(error, res);
  }
}

export async function moveFileController(req, res) {
  try {
    const { old_dir, new_dir } = req.body;
    // const oldPath = getDir(`${baseDir}/test.txt`);

    await moveFile(old_dir, new_dir);
    deleteFileFromDirectory(old_dir);
    res.status(201).json({ status: "success" });
  } catch (error) {
    handleError(error, res);
  }
}

export async function renameFileController(req, res) {
  try {
    let oldFile = req.body.old_file_path;
    let oldFileName = path.basename(oldFile);
    let newFileName = req.body.new_file_name;
    let newFile = oldFile.replace(oldFileName, newFileName);
    if (oldFileName === newFileName)
      throw new ErrorResponse(
        "Old file name cannot be the same as new file name",
        400
      );
    if (renameFile(oldFile, newFile)) return res.status(204).json("ok");
  } catch (error) {
    handleError(error, res);
  }
}

export async function deleteFileController(req, res) {
  try {
    deleteFileFromDirectory(req.body.file_dir);
    res.status(204).json("ok");
  } catch (error) {
    handleError(error, res);
  }
}
export async function writeToFileController(req, res) {
  try {
    writeToFile(req.body.file_dir, req.body.file_content);
    res.status(204).json("ok");
  } catch (error) {
    handleError(error, res);
  }
}
