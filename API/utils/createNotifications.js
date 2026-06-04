
import Notification from '../Models/notificationModelSchema.js';
import { getIO } from '../config/socket.js';

export const createNotification = async ({ vendorId, type, title, message, relatedId = null }) => {
    try {
        const notification = await Notification.create({
            vendorId,
            type,
            title,
            message,
            relatedId
        });

        // Emit to vendor's notification room
        try {
            getIO().to(`vendor_notifications_${vendorId}`).emit("new_notification", notification);
            console.log(`Socket emitted to vendor_notifications_${vendorId}`);
        } catch (socketErr) {
            // Socket failure should never crash the notification save
            console.error('Vendor socket emit failed:', socketErr.message);
        }

        console.log('Vendor Notification created:', notification._id);
        return notification;

    } catch (err) {
        console.error('Vendor Notification creation failed:', err.message);
        return null;
    }
};