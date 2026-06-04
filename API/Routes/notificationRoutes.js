
import express from "express";
import authMiddleware from '../Middlewares/authMiddleware.js';
import {
  getVendorNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../Controllers/notificationController.js";

const router = express.Router();

router.get("/get-all-notification", authMiddleware(['vendor']), getVendorNotifications);

router.patch("/mark-all-read-notification",authMiddleware(['vendor']), markAllNotificationsRead);
router.patch("/read-notification/:id",authMiddleware(['vendor']), markNotificationRead);

export default router;