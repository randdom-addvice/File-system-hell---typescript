import { Router } from "express";
import fileRoutes from "./file.routes.js";
import directoryRoutes from "./directory.routes.js";
const router = Router();

router.use("/files", fileRoutes);
router.use("/directories", directoryRoutes);

router.use((_, res, __) => {
  const error = new Error("API Endpoint Not found");

  res.status(404).json({
    message: error.message,
  });
});

export default router;
