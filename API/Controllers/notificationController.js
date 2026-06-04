
import Notification from '../Models/notificationModelSchema.js';

// get notifications
export const getVendorNotifications = async (req, res) => {
    try {
        const vendorId = req.user.id || req.user._id;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10));
        const skip = (page - 1) * limit;

        // Build filter — isRead query param is optional
        const filter = { vendorId };
        if (req.query.isRead === "true") filter.isRead = true;
        if (req.query.isRead === "false") filter.isRead = false;

        const [notifications, totalCount, unreadCount] = await Promise.all([
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Notification.countDocuments(filter),
            // Always return total unread regardless of active filter
            Notification.countDocuments({ vendorId, isRead: false }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            success: true,
            unreadCount,
            count: notifications.length,
            totalPages,
            data: notifications,
        });

    } catch (error) {
        console.error("getVendorNotifications error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications"
        });
    }
};

// mark all
export const markAllNotificationsRead = async (req, res) => {
  try {
    const vendorId = req.user.id || req.user._id;
 
    const result = await Notification.updateMany(
      { vendorId, isRead: false },
      { $set: { isRead: true } }
    );
 
    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });

  } catch (error) {
    console.error("markAllNotificationsRead error:", error);
    res.status(500).json({ 
        success: false, 
        message: "Failed to mark notifications as read" 
    });
  }
};

// mark read
export const markNotificationRead = async (req, res) => {
  try {
    const vendorId = req.user.id || req.user._id;
    const { id } = req.params;
 
    const notification = await Notification.findOneAndUpdate(
      { _id: id, vendorId }, // vendorId guard — vendor can only mark their own
      { $set: { isRead: true } },
      { new: true }
    );
 
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }
 
    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("markNotificationRead error:", error);
    res.status(500).json({ success: false, message: "Failed to mark notification as read" });
  }
};