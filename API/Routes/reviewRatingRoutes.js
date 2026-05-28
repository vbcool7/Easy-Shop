
import express from 'express';
import authMiddleware from '../Middlewares/authMiddleware.js';
import {
    addReview,
    getProductReviews,
    deleteReview,    
    getUserReviews,
    getVendorReviewStats,
    vendorReviewList,
    getApprovedReviewsForHome,
    replyToReview
} from '../Controllers/reviewRatingController.js';

const router = express.Router();

router.get('/get-product-reviews/:prod_id', getProductReviews);
router.get('/get-approved-reviews-home', getApprovedReviewsForHome);

router.post('/review-add/:prod_id', authMiddleware(['user']), addReview);
router.get('/get-user-reviews', authMiddleware(['user']), getUserReviews);

router.get('/review-stats-vendor', authMiddleware(['vendor']), getVendorReviewStats);
router.get('/review-list-vendor', authMiddleware(['vendor']), vendorReviewList);
router.post('/review-reply/:review_id', authMiddleware(['vendor']), replyToReview);

router.delete('/review-delete/:review_id', authMiddleware(['user', 'admin']), deleteReview);

export default router;