
import express from 'express';
import otpRoutes from './otpRoutes.js';
import vendorRoutes from './vendorRoutes.js';
import userRoutes from './userRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import subCategoryRoutes from './subCategoryRoutes.js';
import productRoutes from './productRoutes.js';
import cartRoutes from './cartRoutes.js';
import wishListRoutes from './wishListRoutes.js';
import orderRoutes from './orderRoutes.js';
import reviewRatingRoutes from './reviewRatingRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import withdrawRoutes from './withdrawRoutes.js';
import adminRoutes from './adminRoutes.js';
import messageRoutes from './messageRoutes.js';
import contactRoutes from './contactRoutes.js';
import blogRoutes from './blogRoutes.js';
import cmsRoutes from './cmsRoutes.js';
import bannerRoutes from './bannerRoutes.js';

const rootRouter = express.Router();

rootRouter.use("/otp", otpRoutes);
rootRouter.use("/vendor", vendorRoutes);
rootRouter.use("/user", userRoutes);
rootRouter.use("/category", categoryRoutes);
rootRouter.use("/subCategory", subCategoryRoutes);
rootRouter.use("/product", productRoutes);
rootRouter.use("/cart", cartRoutes);
rootRouter.use("/wishList", wishListRoutes);
rootRouter.use("/order", orderRoutes);
rootRouter.use("/review", reviewRatingRoutes);
rootRouter.use("/transaction", transactionRoutes);
rootRouter.use("/withdraw", withdrawRoutes);
rootRouter.use("/admin", adminRoutes);
rootRouter.use("/message", messageRoutes);
rootRouter.use("/contact", contactRoutes);
rootRouter.use("/blog", blogRoutes);
rootRouter.use("/cms", cmsRoutes);
rootRouter.use("/banner", bannerRoutes);

export default rootRouter;