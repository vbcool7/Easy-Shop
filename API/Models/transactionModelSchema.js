
import mongoose, { model } from 'mongoose';

const transactionSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true
        },

        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true
        },

        txnId: {
            type: String,
            unique: true,
            required: true
        }, 

        orderDisplayId: {
            type: String,
            required: true
        }, 

        totalAmount: {
            type: Number,
            required: true
        }, 

        platformFee: {
            type: Number,
            required: true
        }, 

        netEarning: {
            type: Number,
            required: true
        }, 

        paymentMethod: {
            type: String,
            enum: ['COD', 'Online'],
            default: 'COD'
        },

        status: {
            type: String,
            enum: ['Pending', 'Completed', 'Cancelled'],
            default: 'Pending'
        }
    },
    { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);