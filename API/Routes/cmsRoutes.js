
import express from "express";
import { getCmsContent, upsertCmsContent } from "../Controllers/cmsController.js";
import authMiddleware from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.get("/get-cms-content/:key", getCmsContent);
router.put("/upsert-cms-content/:key", authMiddleware(["admin"]), upsertCmsContent);

export default router;