
import ReviewRating from '../Models/reviewRatingModelSchema.js';
import Order from '../Models/orderModelSchema.js';
import Product from '../Models/productModelSchema.js';
import mongoose from 'mongoose';

// user
export const addReview = async (req, res) => {
    try {
        const { prod_id } = req.params;
        const userId = req.user.id;

        const { rating, review } = req.body;

        // 1. Check if user has actually purchased and received this product
        const deliveredOrder = await Order.findOne({
            userId,
            "items.productId": prod_id,
            orderStatus: "Delivered"
        });

        if (!deliveredOrder) {
            return res.status(403).json({
                success: false,
                message: "You can only review products that have been successfully delivered to you."
            });
        }

        const isReviewExists = await ReviewRating.findOne({ productId: prod_id, userId });

        if (isReviewExists) {
            isReviewExists.review = review;
            isReviewExists.rating = rating;

            // Agar pehle verified nahi tha par ab order deliver ho gaya hai toh update kar dein
            if (deliveredOrder) isReviewExists.isVerifiedPurchase = true;

            await isReviewExists.save();

            return res.status(200).json({
                success: true,
                message: "Review updated successfully"
            });
        }

        const newReview = new ReviewRating({
            productId: prod_id,
            userId,
            rating,
            review,
            isVerifiedPurchase: !!deliveredOrder
        });

        await newReview.save();

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            data: newReview
        });

    } catch (err) {
        console.log("ERROR :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// user
export const getUserReviews = async (req, res) => {
    try {
        const userId = req.user.id;

        const reviews = await ReviewRating.find({ userId })
            .populate('productId', 'prodName prodImage price')
            .sort({ createdAt: -1 });

        if (reviews.length === 0) {
            return res.status(200).json({
                success: true,
                message: "You have not given a review to any product yet.",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: "User reviews",
            count: reviews.length,
            data: reviews
        });

    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// user - prod detail page
export const getProductReviews = async (req, res) => {
    try {
        const { prod_id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(prod_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const reviews = await ReviewRating.find({
            productId: prod_id,
            status: 'Approved'
        })
            .populate('userId', 'name profilePhoto')
            .populate('productId', 'averageRating totalReviews')
            .sort({ createdAt: -1 });

        if (reviews.length === 0) {
            return res.status(200).json({
                success: false,
                message: "No reviews found for this product yet.",
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Reviews fetched successfully",
            count: reviews.length,
            data: reviews
        });

    } catch (err) {
        console.log("Error : ", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// user - home page reviews
export const getApprovedReviewsForHome = async (req, res) => {
    try {
        const reviews = await ReviewRating.find({ status: 'Approved' })
            .populate('userId', 'name profilePhoto') 
            .populate('productId', 'prodName prodImage') 
            .sort({ createdAt: -1 }) 
            .limit(10); 

        if (reviews.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No approved reviews available for Home Page yet.",
                count: 0,
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: "Home page approved reviews fetched successfully",
            count: reviews.length,
            data: reviews
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            status: false,
            message: "Server Error Occur"
        });
    }
};

// user + admin
export const deleteReview = async (req, res) => {
    try {
        const { review_id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        const review = await ReviewRating.findById(review_id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // ownership check
        if (role !== 'admin' && review.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access Denied: You can only delete your own reviews"
            });
        }

        const productId = review.productId;

        await ReviewRating.findByIdAndDelete(review_id);

        // --- IMPORTANT: Recalculate Average Rating ---
        await ReviewRating.calculateAvgRating(productId);

        res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Error Deleting Review"
        });
    }
};

// vendor review stats
export const getVendorReviewStats = async (req, res) => {
    try {
        const vendorId = req.user.id;

        // 1. Pehle vendor ke saare products ki IDs nikalenge
        const vendorProducts = await Product.find({ vendorId }).select('_id');
        const productIds = vendorProducts.map(p => p._id);

        if (productIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: { avgRating: 0, totalReviews: 0, approved: 0, rejected: 0 }
            });
        }

        // 2. Aggregate pipeline for 4 major stats
        const stats = await ReviewRating.aggregate([
            { $match: { productId: { $in: productIds } } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                    approved: {
                        $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] }
                    },
                    rejected: {
                        $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
                    }
                }
            }
        ]);

        const result = stats[0] || { avgRating: 0, totalReviews: 0, approved: 0, rejected: 0, pending: 0 };

        res.status(200).json({
            success: true,
            data: {
                avgRating: Number(result.avgRating.toFixed(1)), // e.g., 4.5
                totalReviews: result.totalReviews,
                approved: result.approved,
                rejected: result.rejected,
                pending: result.pending
            }
        });

    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// vendor review list
export const vendorReviewList = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { status } = req.query;

        let query = {};

        if (status) query.status = status;

        // 1. find prods
        const vendorProducts = await Product.find({ vendorId }).select('_id');

        if (vendorProducts.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No products found for this vendor",
                data: []
            });
        }

        // 2. Product IDs ki ek array banayein
        const productIds = vendorProducts.map(p => p._id);

        query.productId = { $in: productIds };

        const reviews = await ReviewRating.find(query)
            .populate('userId', 'name email profilePhoto')
            .populate('productId', 'prodName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Vendor review list fetched successfully",
            count: reviews.length,
            data: reviews
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};