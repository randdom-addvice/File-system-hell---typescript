import { Router } from "express";
import {
  createFileController,
  deleteFileController,
  getAllFiles,
  getFile,
  moveFileController,
  renameFileController,
  writeToFileController,
} from "../controllers/file.controller.js";

const router = Router();
router.get("/", getAllFiles);
router.get("/get-file", getFile);
router.post("/create", createFileController);
router.post("/move", moveFileController);
router.patch("/rename", renameFileController);
router.delete("/delete", deleteFileController);
router.patch("/patch", renameFileController);
router.patch("/write", writeToFileController);

export default router;
