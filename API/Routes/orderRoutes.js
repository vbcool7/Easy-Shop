
import express from 'express';
import authMiddleware from '../Middlewares/authMiddleware.js';
import {
    placeCartOrder,
    placeDirectOrder,
    userOrderHistory,
    getVendorOrders,
    updateOrderStatus,
    getSingleOrderDetail,
    cancelOrder,
    orderInvoiceDownload,
    getVendorDashboardStats,
    getVendorSingleOrderDetail,
    getOrderStats,
    createRazorpayOrder,
    verifyRazorpayPayment
} from '../Controllers/orderController.js';

const router = express.Router();

router.post('/create-razorpay-order', authMiddleware(['user']), createRazorpayOrder);
router.post('/verify-payment', authMiddleware(['user']), verifyRazorpayPayment);
router.post('/place-cart-order', authMiddleware(['user']), placeCartOrder);
router.post('/place-direct-order/:prod_id', authMiddleware(['user']), placeDirectOrder);
router.put('/cancel-order/:order_id', authMiddleware(['user']), cancelOrder);
router.get('/user-order-history', authMiddleware(['user']), userOrderHistory);
router.get('/user-order-detail/:order_id', authMiddleware(['user']), getSingleOrderDetail);

router.get('/download-invoice/:order_id', authMiddleware(['user', 'vendor', 'admin']), orderInvoiceDownload);

router.get('/get-vendor-orders', authMiddleware(['vendor']), getVendorOrders);

router.get('/get-vendor-single-order/:order_id', authMiddleware(['vendor', 'admin']), getVendorSingleOrderDetail);
router.patch('/order-status-update/:order_id', authMiddleware(['vendor', 'admin']), updateOrderStatus);
router.get('/get-vendor-stats', authMiddleware(['vendor', 'admin']), getVendorDashboardStats);
router.get('/vendor-order-stats', authMiddleware(['admin', 'vendor']), getOrderStats);

export default router;