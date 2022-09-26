import { Router } from "express";
import {
  createDirectoryController,
  deleteDirectoryController,
  getAllDirectories,
  moveDirectoryController,
  renameDirectoryController,
} from "../controllers/directory.controller.js";

const router = Router();

router.get("/", getAllDirectories);
router.post("/create", createDirectoryController);
router.patch("/rename", renameDirectoryController);
router.delete("/delete", deleteDirectoryController);
router.post("/move", moveDirectoryController);

export default router;
