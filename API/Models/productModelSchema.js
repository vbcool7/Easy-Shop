
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: function () { return this.role === 'vendor'; }, // Sirf Vendor ke liye mandatory
            index: true
        },

        catId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
            index: true
        },

        subCatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubCategory',
            required: true,
            index: true
        },

        prodName: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        originalPrice: {
            type: Number,
            required: true
        },

        stock: {
            type: Number,
            required: true
        },

        variants: [
            {
                color: {
                    type: String,
                    default: null,
                    trim: true
                },

                size: {
                    type: String,
                    default: null,
                    trim: true
                },

                stock: {
                    type: Number,
                    required: true,
                    default: 0,
                    min: 0
                }
            }
        ],

        attributes: {
            type: Map,
            of: mongoose.Schema.Types.Mixed // Mixed matlab String, Number, ya Array kuch bhi aa sakta hai
        },

        prodImage: {
            type: String,
            required: true
        },

        prodImages: {
            type: [String],
            default: []
        },

        images: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
},

        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'role' // Ye dynamically user ya admin ko refer karega
        },

        role: {
            type: String,
            required: true,
            enum: ['Admin', 'admin', 'vendor']
        },

        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending' // Admin ke products auto-approve honge, vendor ke check honge
        },

        isNewArrival: {
            type: Boolean,
            default: false
        },

        isBestSeller: {
            type: Boolean,
            default: false
        },

        totalSold: {
            type: Number,
            default: 0
        },

        averageRating: {
            type: Number,
            default: 0
        },

        totalReviews: {
            type: Number,
            default: 0
        },

        isActive: {
            type: Boolean,
            required: true,
            default: true
        }

    },
    { timestamps: true }
);

// Performance Optimization
productSchema.index({ prodName: 'text', description: 'text' }); 
productSchema.index({ slug: 1 });

// After your existing indexes, before export
productSchema.virtual('stockStatus').get(function () {
    if (this.stock === 0) return 'Out of Stock';
    if (this.stock <= 5) return 'Critical';
    if (this.stock <= 20) return 'Low Stock';
    if (this.stock <= 50) return 'Medium';
    return 'High Stock';
});

// Required to include virtuals in JSON response
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);