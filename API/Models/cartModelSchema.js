
import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },

        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                    default: 1
                },

                selectedColor: { type: String, default: null },
                selectedSize: { type: String, default: null },

                variantId: {
                    type: mongoose.Schema.Types.ObjectId,
                    default: null
                },

                prodImage: { type: String, default: null },
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

export default mongoose.model('Cart', cartSchema);