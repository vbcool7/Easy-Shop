
import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true
        },

        lastName: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true
        },

        contact: {
            type: String,
            required: true
        },

        category: {
            type: String,
            required: true
        },

        subCategory: {
            type: String,
            required: false
        },

        orderId: {
            type: String,
            required: false
        },

        message: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ['Pending', 'In-Progress', 'Resolved'], 
            default: 'Pending'
        },

        isActive: {
            type: Boolean,
            required: true,
            default: true
        }
    },
    { timestamps: true }
)

export default mongoose.model('Contact', contactSchema);