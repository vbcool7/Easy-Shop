
import ReviewRating from '../Models/reviewRatingModelSchema.js';
import Order from '../Models/orderModelSchema.js';
import Product from '../Models/productModelSchema.js';
import mongoose from 'mongoose';
import sendEmail from '../utils/sendEmail.js';
import { createNotification } from '../utils/createNotifications.js';

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

        const product = await Product.findById(prod_id).select("vendorId prodName");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const isReviewExists = await ReviewRating.findOne({ productId: prod_id, userId });

        if (isReviewExists) {
            isReviewExists.review = review;
            isReviewExists.rating = rating;

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

        await createNotification({
            vendorId: product.vendorId,
            type: 'NEW_REVIEW',
            title: "New Review Received",
            message: `A customer left a ${rating}-star review on "${product.prodName}"`,
            relatedId: newReview._id
        })

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

// user - my reviews
// export const getUserReviews = async (req, res) => {
//     try {
//         const userId = req.user.id;

//         const reviews = await ReviewRating.find({ userId })
//             .populate('productId', 'prodName prodImage price attributes')
//             .sort({ createdAt: -1 });

//         if (reviews.length === 0) {
//             return res.status(200).json({
//                 success: true,
//                 message: "You have not given a review to any product yet.",
//                 data: []
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "User reviews",
//             count: reviews.length,
//             data: reviews
//         });

//     } catch (err) {
//         console.log("Error: ", err);
//         res.status(500).json({
//             success: false,
//             message: "Server Error Occur"
//         });
//     }
// };

export const getUserReviews = async (req, res) => {
    try {
        const userId = req.user.id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await ReviewRating.countDocuments({ userId });

        if (total === 0) {
            return res.status(200).json({
                success: true,
                message: "You have not given a review to any product yet.",
                totalPages: 0,
                count: 0,
                data: []
            });
        }

        const paginatedReviews = await ReviewRating.find({ userId })
            .populate('productId', 'prodName prodImage price attributes')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            message: "User reviews",
            count: total,
            totalPages: Math.ceil(total / limit),
            data: paginatedReviews
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
                success: true,
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

        const { status, page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        let query = {};
        if (status) query.status = status;

        // 1. find prods
        const vendorProducts = await Product.find({ vendorId }).select('_id');

        if (vendorProducts.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No products found for this vendor",
                totalPages: 1,
                count: 0,
                data: []
            });
        }

        // 2. Product IDs ki array banayein
        const productIds = vendorProducts.map(p => p._id);
        query.productId = { $in: productIds };

        // 3. Get Total Count for Pagination calculation
        const totalReviews = await ReviewRating.countDocuments(query);
        const totalPages = Math.ceil(totalReviews / limitNumber);

        // 4. Fetch paginated slice data
        const reviews = await ReviewRating.find(query)
            .populate('userId', 'name email profilePhoto')
            .populate('productId', 'prodName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber);

        res.status(200).json({
            success: true,
            message: "Vendor review list fetched successfully",
            totalPages: totalPages || 1,
            count: totalReviews,
            data: reviews
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occurred"
        });
    }
};

// reply to customer
// export const replyToReview = async (req, res) => {
//     try {
//         const vendorId = req.user.id || req.user._id;
//         const { review_id } = req.params;
//         const { replyText } = req.body;

//         if (!replyText || replyText.trim() === "") {
//             return res.status(400).json({
//                 success: false,
//                 message: "Reply text cannot be empty"
//             });
//         }

//         const review = await ReviewRating.findById(review_id).populate('productId');

//         if (!review) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Review not found"
//             });
//         }

//         if (review.productId.vendorId.toString() !== vendorId) {
//             return res.status(403).json({
//                 success: false,
//                 message: "Unauthorized. This product is not yours."
//             });
//         }

//         // Update with the reply data
//         review.vendorReply = replyText;
//         review.vendorRepliedAt = new Date();

//         await review.save();

//         res.status(200).json({
//             success: true,
//             message: "Reply submitted successfully",
//             data: review
//         });

//     } catch (err) {
//         console.error("Error in replyToReview:", err);
//         res.status(500).json({
//             success: false,
//             message: "Server Error Occurred"
//         });
//     }
// };

export const replyToReview = async (req, res) => {
    try {
        const vendorId = req.user.id || req.user._id;
        const { review_id } = req.params;
        const { replyText } = req.body;

        if (!replyText || replyText.trim() === "") {
            return res.status(400).json({ success: false, message: "Reply text cannot be empty" });
        }

        // FIX: productId aur userId dono ko populate kiya, userId se email aur name select kiya
        const review = await ReviewRating.findById(review_id)
            .populate('productId')
            .populate({ path: 'userId', select: 'email name' });

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        if (!review.productId) {
            return res.status(404).json({ success: false, message: "Associated product not found" });
        }

        if (review.productId.vendorId.toString() !== vendorId) {
            return res.status(403).json({ success: false, message: "Unauthorized. This product is not yours." });
        }

        const isFirstTimeReply = !review.vendorReply || review.vendorReply.trim() === "";

        review.vendorReply = replyText;
        review.vendorRepliedAt = new Date();
        await review.save();

        // ----------- RESEND EMAIL INTEGRATION -----------
        if (isFirstTimeReply && review.userId?.email) {
            const customerEmail = review.userId.email;
            const customerName = review.userId.name || "Customer";
            const productName = review.productId.prodName;

            const emailSubject = `New reply on your review for ${productName}! ✨`;

            // Ek clean HTML template aapke mail ke liye
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; padding: 20px; rounded: 12px;">
                    <h2 style="color: #ec4899;">Hi ${customerName},</h2>
                    <p>The vendor has replied to your product review on <strong>${productName}</strong>.</p>
                    
                    <div style="background-color: #f9fafb; border-left: 4px solid #e5e7eb; padding: 10px 15px; margin: 15px 0; font-style: italic;">
                        "Your review: ${review.review}"
                    </div>

                    <div style="background-color: #fdf2f8; border-left: 4px solid #ec4899; padding: 10px 15px; margin: 15px 0; font-weight: bold;">
                        "Vendor's Reply: ${replyText}"
                    </div>

                    <p style="margin-top: 25px; font-size: 13px; color: #666;">
                        Thank you for being a valued customer!<br/>
                        <strong>Team EasyShop</strong>
                    </p>
                </div>
            `;

            // Background mein email send karein taaki API response slow na ho
            sendEmail(customerEmail, emailSubject, emailHtml)
                .catch(emailErr => console.error("Background Email Error:", emailErr.message));
        }

        res.status(200).json({
            success: true,
            message: isFirstTimeReply ? "Reply submitted successfully" : "Reply updated successfully",
            data: review
        });

    } catch (err) {
        console.error("Error in replyToReview:", err);
        res.status(500).json({ success: false, message: "Server Error Occurred" });
    }
};