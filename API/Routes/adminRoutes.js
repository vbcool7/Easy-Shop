
import express from 'express';
import authMiddleware from '../Middlewares/authMiddleware.js';
import { upload } from '../Middlewares/imageStorage.js';
import {
    signupAdmin,
    loginAdmin,
    logoutAdmin,
    getAdmin,
    updateAdminProfile,
    getAdminDashboardStats,
    getVendorList,
    toggleVendorStatus,
    getAdminProductList,
    updateProductStatus,
    toggleProductNewArrival,
    getVendorStats,
    getAllOrders,
    getUserList,
    toggleUserStatus,
    deleteUser,
    adminReviewList,
    updateReviewStatus,
    deleteReview,
    getAllTransactions,
    toggleTransactionStatus,
    getAllWithdrawRequests,
    toggleWithdrawStatus,
    toggleBestSeller,
    listBlog,
    updateBlogStatus,
    deleteBlog,
    getOrdersOverTime,
    getOrderStatusBreakdown,
    getRevenueByPaymentMethod,
    getTopProducts

} from '../Controllers/adminController.js';

const router = express.Router();

router.post('/admin-signup', upload.single('profileAdmin'), signupAdmin);
router.post('/admin-login', loginAdmin);
router.post('/admin-logout', logoutAdmin);
router.get('/admin-detail', authMiddleware(['admin']), getAdmin);
router.get('/admin-profile-setting', authMiddleware(['admin']), updateAdminProfile);

router.get('/get-vendor-list', authMiddleware(['admin']), getVendorList);
router.patch('/vendor-toggle-status/:vendor_id', authMiddleware(['admin']), toggleVendorStatus);
router.get('/get-product-list', authMiddleware(['admin']), getAdminProductList);
router.patch('/update-product-status/:product_id', authMiddleware(['admin']), updateProductStatus);
router.patch('/toggle-product-arrival/:product_id', authMiddleware(['admin']), toggleProductNewArrival);
router.get('/vendor-stats', authMiddleware(['admin']), getVendorStats);
router.get('/get-all-orders', authMiddleware(['admin']), getAllOrders);
router.get('/get-user-list', authMiddleware(['admin']), getUserList);
router.patch('/toggle-user-status/:user_id', authMiddleware(['admin']), toggleUserStatus);
router.delete('/delete-user/:user_id', authMiddleware(['admin']), deleteUser);
router.get('/review-list', authMiddleware(['admin']), adminReviewList);
router.patch('/review-status-update/:review_id', authMiddleware(['admin']), updateReviewStatus);
router.delete('/review-delete/:review_id', authMiddleware(['admin']), deleteReview);
router.get('/get-all-transactions', authMiddleware(['admin']), getAllTransactions);
router.patch('/toggle-transaction-status/:transaction_id', authMiddleware(['admin']), toggleTransactionStatus);
router.get('/get-all-withdrawal-request', authMiddleware(['admin']), getAllWithdrawRequests);
router.patch('/toggle-withdraw-status/:withdraw_id', authMiddleware(['admin']), toggleWithdrawStatus);
router.patch('/toggle-best-seller/:product_id', authMiddleware(['admin']), toggleBestSeller);
router.get('/list-blog', authMiddleware(['admin']), listBlog);
router.patch('/update-blog-status/:blog_id', authMiddleware(['admin']), updateBlogStatus);
router.delete('/delete-blog/:blog_id', authMiddleware(['admin']), deleteBlog);

router.get('/dashboard-stats', authMiddleware(['admin']), getAdminDashboardStats);
router.get('/orders-over-time', authMiddleware(['admin']), getOrdersOverTime);
router.get('/order-status-breakdown', authMiddleware(['admin']), getOrderStatusBreakdown);
router.get('/revenue-by-payment', authMiddleware(['admin']), getRevenueByPaymentMethod);
router.get('/top-products', authMiddleware(['admin']), getTopProducts);

export default router;