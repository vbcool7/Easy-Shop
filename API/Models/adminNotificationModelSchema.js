
import mongoose from 'mongoose';

const adminNotificationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['NEW_VENDOR', 'NEW_USER', 'NEW_ORDER', 'NEW_PRODUCT', 'PAYOUT_REQUEST', 'LOW_STOCK'],
            required: true
        },

        title: {
            type: String,
            required: true
        },

        message: {
            type: String,
            required: true
        },

        relatedId: {
            type: mongoose.Schema.Types.ObjectId
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },

    { timestamps: true }
);

adminNotificationSchema.index({ isRead: 1, createdAt: -1 });

export default mongoose.model('AdminNotification', adminNotificationSchema);