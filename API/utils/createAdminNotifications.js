
import AdminNotification from '../Models/adminNotificationModelSchema.js';
import { getIO } from '../config/socket.js';

export const createAdminNotification = async ({ type, title, message, relatedId }) => {
    try {
        const adminNotification = await AdminNotification.create({
            type,
            title,
            message,
            relatedId
        });

        // Emit to admin notification room
        try {
            getIO().to("admin_notifications").emit("new_notification", adminNotification);
            console.log('Socket emitted to admin_notifications');
        } catch (socketErr) {
            console.error('Admin socket emit failed:', socketErr.message);
        }

        console.log('Admin Notification created:', adminNotification._id); 
        return adminNotification;

    } catch (err) {
        console.error('createAdminNotification error:', err);
        return null;
    }
};