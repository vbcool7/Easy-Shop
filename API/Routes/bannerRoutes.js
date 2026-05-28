
import express from "express";
import {
  getBannersByZone,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../Controllers/bannerController.js";

import { uploadBanner } from "../Middlewares/bannerStorage.js";
import authMiddleware from "../Middlewares/authMiddleware.js";

const router = express.Router();

router.get("/get-banners/:zone", getBannersByZone);
router.post("/create-banner", authMiddleware(["admin"]), uploadBanner.single("image"), createBanner);
router.put("/update-banner/:id", authMiddleware(["admin"]), uploadBanner.single("image"), updateBanner);
router.delete("/delete-banner/:id", authMiddleware(["admin"]), deleteBanner);

export default router;