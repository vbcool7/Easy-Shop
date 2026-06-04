
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        review: {
            type: String,
            required: true,
            trim: true
        },

        isVerifiedPurchase: {
            type: Boolean,
            default: false
        },

        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },

        vendorReply: {
            type: String,
            default: ""
        },

        vendorRepliedAt: {
            type: Date
        }

    },
    { timestamps: true }
);

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// ------------------ find average rating ----------------
reviewSchema.statics.calculateAvgRating = async function (productId) {
    const stats = await this.aggregate([
        { $match: { productId: productId, status: 'Approved' } },
        {
            $group: {
                _id: '$productId',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            totalReviews: stats[0].nRating,
            averageRating: Math.round(stats[0].avgRating * 10) / 10
        });
    } else {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            totalReviews: 0,
            averageRating: 0
        });
    }
};

// for new review
reviewSchema.post('save', function () {
    this.constructor.calculateAvgRating(this.productId);
});

// for review dlt
reviewSchema.post('deleteOne', { document: true, query: false }, function () {
    this.constructor.calculateAvgRating(this.productId);
});

export default mongoose.model('Review', reviewSchema);