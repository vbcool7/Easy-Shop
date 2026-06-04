
import AdminNotification from '../Models/adminNotificationModelSchema.js';

// get
export const getAdminNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const [notifications, totalCount, unreadCount] = await Promise.all([
            AdminNotification.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            AdminNotification.countDocuments(),
            AdminNotification.countDocuments({ isRead: false })
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            success: true,
            count: notifications.length,
            totalPages,
            unreadCount,
            data: notifications
        });

    } catch (err) {
        console.error('getAdminNotifications error:', err);
        res.status(500).json({ success: false, message: 'Server Error Occur' });
    }
};

// mark-all-read
export const markAllAdminNotificationsRead = async (req, res) => {
    try {
        await AdminNotification.updateMany({ isRead: false }, { isRead: true });
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        console.error('markAllAdminNotificationsRead error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// read
export const markAdminNotificationRead = async (req, res) => {
    try {
        const notification = await AdminNotification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.status(200).json({ success: true, data: notification });
    } catch (err) {
        console.error('markAdminNotificationRead error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};