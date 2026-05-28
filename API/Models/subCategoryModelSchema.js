
import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
    {
        catId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
            index: true
        },

        subCatName: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },

        description: {
            type: String,
            required: true
        },

        subCatImage: {
            type: String,
            required: true
        },

        order: { // Categories ko sort karne ke liye
            type: Number,
            default: 0
        },

        allowedAttributes: [
            {
                name: { type: String, required: true }, // e.g. "Processor", "RAM"
                unit: { type: String, default: "" },    // e.g. "GB", "inch" (Optional)
                isFilterable: { type: Boolean, default: true }, // Kya iska filter sidebar mein dikhana hai?
                hasVariants: { type: Boolean, default: false }, // NEW - Color/Size selector dikhana hai?
                type: { type: String, enum: ['text', 'color', 'size'], default: 'text' } // NEW - kis type ka variant hai
            }
        ],

        showOnHome: { 
            type: Boolean, 
            default: false 
        },

        isActive: {
            type: Boolean,
            default: true,
        }
    },

    { timestamps: true }
);

// Ek hi category ke andar same naam ka sub-category na ho, isliye compound index
subCategorySchema.index({ catId: 1, subCatName: 1 }, { unique: true });

export default mongoose.model('SubCategory', subCategorySchema);