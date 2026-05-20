
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },

                vendorId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Vendor',
                    required: true
                },

                quantity: {
                    type: Number,
                    required: true,
                    default: 1
                },

                price: {
                    type: Number,
                    required: true,
                },

                selectedColor: {
                    type: String,
                    default: null
                },

                selectedSize: {
                    type: String,
                    default: null
                },

                variantId: {
                    type: mongoose.Schema.Types.ObjectId,
                    default: null
                }
            }
        ],

        totalAmount: {
            type: Number,
            required: true
        },

        shippingAddress: {
            name: { type: String, required: true },
            contact: { type: String, required: true },
            pincode: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
        },

        paymentMethod: {
            type: String,
            enum: ['COD', 'Online'],
            default: 'COD'
        },

        paymentStatus: {
            type: String,
            enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
            default: 'Pending'
        },

        orderStatus: {
            type: String,
            enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled', 'Pending'],
            default: 'Pending'
        },

        transactionId: {
            type: String,
            default: ""
        },

        deliveredAt: {
            type: Date,
        },

        trackingHistory: [
            {
                status: String,
                timestamp: { type: Date, default: Date.now }
            }
        ],

        isActive: {
            type: Boolean,
            required: true,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model('Order', orderSchema);