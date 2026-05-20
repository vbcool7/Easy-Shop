
import express from 'express';
import { upload } from '../Middlewares/imageStorage.js';
import authMiddleware from '../Middlewares/authMiddleware.js';
import {
    vendorSignUp,
    vendorLogin,
    forgotPassword,
    resetPassword,
    changePassword,
    countVendor,
    getVendor,
    updateVendorDetail,
    vendorLogout,
    vendorDashboardStats,
    getVendorCustomers,
    getVendorCustomerStats,
    getCustomerDetailsForVendor,
    vendorOrdersOverTime,
    vendorOrderStatus,
    vendorTopProducts,
} from '../Controllers/vendorController.js';

const router = express.Router();

const vendorUploads = upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'storeLogo', maxCount: 1 },
    { name: 'categoryLicenseUpload', maxCount: 1 },
    { name: 'panCardUpload', maxCount: 1 },
    { name: 'gstDocumentUpload', maxCount: 1 },
    { name: 'bankDocumentUpload', maxCount: 1 }
]);

//public
router.post("/vendor-signup", vendorUploads, vendorSignUp);
router.post("/vendor-login", vendorLogin);
router.post("/vendor-forgot-password", forgotPassword);
router.post("/vendor-reset-password/:vendor_id/:token", resetPassword);
router.get("/vendor-count", countVendor);

//protected
router.put("/change-password", authMiddleware(['vendor']), changePassword);
router.get("/vendor-profile", authMiddleware(['vendor', 'admin']), getVendor);
router.get("/vendor-get/:vendorId", authMiddleware(['vendor', 'admin']), getVendor);
router.put("/vendor-detail-update",authMiddleware(['vendor']), vendorUploads, updateVendorDetail);
router.post("/vendor-logout", authMiddleware(['vendor']), vendorLogout);
router.get("/vendor-dashboard-stats", authMiddleware(['vendor']), vendorDashboardStats);
router.get('/vendor-customers', authMiddleware(['vendor']), getVendorCustomers);
router.get('/vendor-customer-stats', authMiddleware(['vendor']), getVendorCustomerStats);
router.get('/vendor-customer-detail/:id', authMiddleware(['vendor']), getCustomerDetailsForVendor);
router.get("/orders-over-time", authMiddleware(['vendor']), vendorOrdersOverTime);
router.get("/order-status", authMiddleware(['vendor']), vendorOrderStatus);
router.get("/top-products",authMiddleware(['vendor']), vendorTopProducts);

export default router;