
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true
        },

        type: {
            type: String,
            enum: ['NEW_ORDER', 'NEW_REVIEW', 'LOW_STOCK', 'PRODUCT_UPDATE', 'TRANSACTION_UPDATE', 'WITHDRAWAL_UPDATE'],
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
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },

        isRead: {
            type: Boolean,
            default: false
        },
    },

    { timestamps: true }
);

notificationSchema.index({ vendorId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);