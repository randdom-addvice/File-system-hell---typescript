import {
  createDirectory,
  deleteDirectory,
  listDirectories,
  moveDirectory,
  readAllDirectory,
  renameDirectory,
} from "../services/directory-services.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import { baseDirectory } from "../utils/constants.js";
import { handleError } from "../utils/errorResponse.js";
let rootDir = path.resolve("./myFiles");

export async function getAllDirectories(req, res) {
  try {
    const directories = await listDirectories(baseDirectory);
    res.status(200).json({ root_dir: rootDir, directories });
  } catch (error) {
    handleError(error, res);
  }
}

export async function createDirectoryController(req, res) {
  try {
    let dir = path.resolve(baseDirectory, req.body.new_directory);
    createDirectory(dir);
    res.status(201).json({ success: true });
  } catch (error) {
    handleError(error, res);
  }
}

export async function renameDirectoryController(req, res) {
  try {
    let oldPath = req.body.old_file_path;
    let oldDirectoryName = path.basename(oldPath);
    let newDirectoryName = req.body.new_directory_name;
    let newDirectory = oldPath.split("\\"); //oldFile.replace(oldDirectoryName, newDirectoryName);
    newDirectory[newDirectory.length - 1] = newDirectoryName;
    if (oldDirectoryName === newDirectoryName)
      throw new ErrorResponse(
        "Old directory name cannot be the same as new directory name",
        400
      );
    // res.send(oldDirectoryName);
    if (renameDirectory(oldPath, newDirectory.join("\\")))
      return res.status(204).json("ok");
  } catch (error) {
    handleError(error, res);
  }
}

export async function deleteDirectoryController(req, res) {
  try {
    deleteDirectory(req.body.directory);
    res.status(204).json("ok");
  } catch (error) {
    handleError(error, res);
  }
}

export async function moveDirectoryController(req, res) {
  try {
    let { old_dir, new_dir } = req.body;
    let destination = path.basename(old_dir);
    let newDirPath = new_dir.concat(`\\${destination}`);
    // console.log("destination=====> ", destination);
    // console.log("newDirPath=====> ", newDirPath);
    moveDirectory(old_dir, newDirPath);
    res.status(204).json("ok");
  } catch (error) {
    console.log(error, "error");
    handleError(error, res);
  }
}
