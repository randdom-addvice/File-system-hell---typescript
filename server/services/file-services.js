import fs from "fs";
import path from "path";
import { ErrorResponse } from "../utils/errorResponse.js";

export function getDir(filePath) {
  let resolvedPath = path.resolve(filePath);
  return resolvedPath;
}

export function readFileContent(fileDir) {
  try {
    checkFileExists(fileDir);
    const fileType = path.extname(fileDir);
    const fileName = path.basename(fileDir);
    if (!fileType) throw new ErrorResponse("NO file in current Directory", 200);
    let buffer = fs.readFileSync(fileDir);
    let strData = buffer.toString();
    return {
      content:
        fileType === ".json"
          ? strData
            ? JSON.parse(strData)
            : "" /* check if json file is valid and has content */
          : strData,
      fileName,
      fileType,
    };
  } catch (error) {
    // console.log("rrr");
    throw error;
  }
}

export function readAllDir(dir) {
  let filenames = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((i) => !i.isDirectory());
  // console.log(filenames);
  return filenames;
}

export function createFile(filePath, content) {
  try {
    if (fs.existsSync(filePath)) throw new ErrorResponse("File already exist");
    const data = fs.writeFileSync(filePath, content);
    return data;
  } catch (error) {
    throw error;
  }
}

export function moveFile(from, to) {
  const source = fs.createReadStream(from);
  const destination = fs.createWriteStream(to);

  return new Promise((resolve, reject) => {
    source.on("end", resolve);
    source.on("error", reject);
    source.pipe(destination);
  });
}

export function deleteFileFromDirectory(dir) {
  try {
    checkFileExists(dir);
    // fs.rmdirSync(dir, { recursive: true });
    fs.unlinkSync(dir);
    return true;
  } catch (error) {
    throw error;
  } finally {
  }
}

export function renameFile(oldFileName, newFileName) {
  try {
    checkFileExists(oldFileName);
    fs.renameSync(oldFileName, newFileName);
    return true;
  } catch (error) {
    throw error;
  }
}

export function checkFileExists(fileDir) {
  try {
    fs.accessSync(fileDir, fs.constants.F_OK);
    return true;
  } catch (error) {
    throw new ErrorResponse("File doesn't exist", 200);
  }
}
export function writeToFile(fileDir, content) {
  try {
    checkFileExists(fileDir);
    fs.writeFileSync(fileDir, content, function (err) {
      if (err) {
        throw err;
      }
    });
    return true;
  } catch (error) {
    throw error;
  }
}
