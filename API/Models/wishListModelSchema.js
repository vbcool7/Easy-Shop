
import mongoose, { Types } from "mongoose";

const wishListSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                
                selectedColor: { type: String, default: null },
                selectedSize: { type: String, default: null },
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

export default mongoose.model('WishList', wishListSchema);