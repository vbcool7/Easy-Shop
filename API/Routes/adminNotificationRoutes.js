
import express from 'express';
import {
    getAdminNotifications,
    markAllAdminNotificationsRead,
    markAdminNotificationRead
} from '../Controllers/adminNotificationController.js';

import authMiddleware from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.get('/get-all-notification',authMiddleware(['admin']), getAdminNotifications);
router.patch('/mark-all-read-notification', authMiddleware(['admin']), markAllAdminNotificationsRead);
router.patch('/read-notification/:id', authMiddleware(['admin']), markAdminNotificationRead);

export default router;