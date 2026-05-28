
import Admin from '../Models/adminModelSchema.js';
import Vendor from '../Models/vendorModelSchema.js';
import User from '../Models/userModelSchema.js';
import Order from '../Models/orderModelSchema.js';
import Product from '../Models/productModelSchema.js';
import ReviewRating from '../Models/reviewRatingModelSchema.js';
import Transaction from '../Models/transactionModelSchema.js';
import Withdraw from '../Models/withdrawModelSchema.js';
import Blog from '../Models/blogModelSchema.js';

import { deleteCloudinaryFiles, deleteOldFileFromCloudinary } from '../utils/cloudinaryUtils.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signupAdmin = async (req, res) => {
    try {
        const { name, email, password, adminSecret } = req.body;
        const profileAdminPath = req.file ? req.file.path : "";

        if (adminSecret !== process.env.ADMIN_SECRET_KEY) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(403).json({
                success: false,
                message: "Unauthorized! Invalid Secret Key"
            });
        }

        if (!name || !email || !password) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(400).json({
                success: false,
                message: "All fields are mandatory"
            });
        }

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            if (req.file) await deleteCloudinaryFiles(req.file);
            return res.status(400).json({
                success: false,
                message: "Admin email already registered"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await Admin({
            name,
            email,
            password: hashedPassword,
            profileAdmin: profileAdminPath
        });

        await newAdmin.save();
        res.status(201).json({
            success: true,
            message: "Admin account created!",
            data: { name, email }
        });

    } catch (err) {
        if (req.file) await deleteCloudinaryFiles(req.file);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
}

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(404).json({
                success: false,
                message: "Email and Password are required"
            });
        }

        const admin = await Admin.findOne({ email });

        if (!admin)
            return res.status(404).json({
                success: false,
                message: "Admin not registsred"
            });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch)
            return res.status(401).json({
                success: false,
                message: "Invalid Email or Password"
            });

        // Token mein ID aur Role dono bhejein
        const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });

        res.status(200).json({
            success: true,
            message: "Admin login success",
            token,
            admin: { name: admin.name, email: admin.email }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};

export const logoutAdmin = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const getAdmin = async (req, res) => {
    try {
        const adminId = req.user.id;

        const admin = await Admin.findById(adminId).select("-password");

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        res.status(200).json({
            success: true,
            data: admin
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

export const updateAdminProfile = async (req, res) => {
    try {
        const { name } = req.body;
        const adminId = req.user.id; // From your auth middleware

        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            { name },
            { new: true }
        ).select("-password");

        res.status(200).json({
            success: true,
            data: updatedAdmin
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// admin dashboard stats
export const getAdminDashboardStats = async (req, res) => {
    try {
        // 1. find total revenue (Aggregation)
        const revenueData = await Order.aggregate([
            { $match: { orderStatus: "Delivered", paymentStatus: "Completed" } },
            { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalSales : 0;

        // 2. find counts
        const totalOrders = await Order.countDocuments();

        // Pending = Processing + Shipped
        const pendingOrders = await Order.countDocuments({
            orderStatus: { $in: ["Processing", "Shipped"] }
        });

        const cancelledOrders = await Order.countDocuments({ orderStatus: "Cancelled" });
        const totalUsers = await User.countDocuments({ role: "user" });
        const totalVendors = await Vendor.countDocuments({ role: "vendor" });

        res.status(200).json({
            success: true,
            message: "Admin Dashboard Statistics",
            data: {
                totalRevenue,
                totalOrders,
                pendingOrders,
                cancelledOrders,
                totalUsers,
                totalVendors
            }
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

// Orders over time (Line Chart)
export const getOrdersOverTime = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const orders = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    orders: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const formattedData = orders.map(item => ({
            date: item._id,
            orders: item.orders,
            revenue: item.revenue
        }));

        res.status(200).json({
            success: true,
            count: formattedData.length,
            data: formattedData
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// Order status breakdown (Donut Chart)
export const getOrderStatusBreakdown = async (req, res) => {
    try {
        const breakdown = await Order.aggregate([
            { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
        ]);

        const data = breakdown.map(item => ({
            name: item._id,
            value: item.count
        }));

        res.status(200).json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Revenue by payment method (Bar Chart)
export const getRevenueByPaymentMethod = async (req, res) => {
    try {
        const data = await Order.aggregate([
            { $match: { paymentStatus: "Completed" } },
            {
                $group: {
                    _id: "$paymentMethod",
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            }
        ]);

        const result = data.map(item => ({
            name: item._id,
            revenue: item.revenue,
            orders: item.orders
        }));

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get Top 5 Selling Products
export const getTopProducts = async (req, res) => {
    try {
        const topProducts = await Order.aggregate([

            // not include cancel order
            { $match: { orderStatus: { $ne: "Cancelled" } } },

            { $unwind: "$items" },

            {
                $group: {
                    _id: "$items.productId",
                    totalSold: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },

            { $sort: { totalSold: -1 } },

            { $limit: 5 },

            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },

            { $unwind: "$productDetails" }
        ]);

        const formattedData = topProducts.map(item => ({
            name: item.productDetails.prodName || "Unknown Product",
            sales: item.totalSold,
            revenue: item.totalRevenue
        }));

        res.status(200).json({
            success: true,
            data: formattedData
        });

    } catch (err) {
        console.error("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// vendors list
export const getVendorList = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { storeName: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Vendor.countDocuments(query);

        const vendor = await Vendor.find(query)
            .select('-password')
            .populate('profilePhoto name email storeName contact category createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        if (!vendor || vendor.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No vendors found",
                count: 0,
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Vendor list fetched successfully!",
            count: total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            data: vendor
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// vendor toggle status
export const toggleVendorStatus = async (req, res) => {
    try {
        const { vendor_id } = req.params;

        const vendor = await Vendor.findById(vendor_id);

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });
        };

        vendor.isActive = !vendor.isActive;
        await vendor.save();

        res.status(200).json({
            success: true,
            message: `Vendor is now ${vendor.isActive ? 'Active' : 'Inactive'}`,
            isActive: vendor.isActive
        });

    } catch (err) {
        console.log("Error:", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    };
};

// vendor stats
export const getVendorStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [total, active, inactive, newThisMonth] = await Promise.all([
            Vendor.countDocuments(),
            Vendor.countDocuments({ isActive: true }),
            Vendor.countDocuments({ isActive: false }),
            Vendor.countDocuments({ createdAt: { $gte: startOfMonth } })
        ]);

        res.status(200).json({
            success: true,
            data: { total, active, inactive, newThisMonth }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// all prod
export const getAdminProductList = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        let query = {};
        if (search) {
            query.prodName = { $regex: search, $options: "i" };
        }

        const [products, totalCount] = await Promise.all([
            Product.find(query)
                .populate("catId", "catName")
                .populate("subCatId", "subCatName")
                .populate("vendorId", "storeName name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Product.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            count: totalCount,
            totalPages: Math.ceil(totalCount / Number(limit)),
            data: products
        });

    } catch (err) {
        console.error("Admin Product Fetch Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// toggle prod status 
export const updateProductStatus = async (req, res) => {
    try {
        const { product_id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Approved', 'Rejected'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const product = await Product.findByIdAndUpdate(
            product_id,
            { status },
            { new: true }
        );

        if (!product)
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });

        return res.status(200).json({
            success: true,
            message: `Product status updated to ${status} successfully`,
            data: product
        });

    } catch (err) {
        console.log("Error :", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// toggle new arrival
export const toggleProductNewArrival = async (req, res) => {
    try {
        const { product_id } = req.params;

        const product = await Product.findById(product_id);

        if (!product) {
            return res.status(404).json({
                status: false,
                message: "Product not found"
            });
        };

        product.isNewArrival = !product.isNewArrival;
        await product.save();

        res.status(200).json({
            status: true,
            message: `Product is ${product.isNewArrival ? "marked as New Arrival" : "removed from New Arrivals"}`,
            isNewArrival: product.isNewArrival
        });

    } catch (err) {
        console.log("Error : ", err);
        res.status(500).json({
            status: false,
            message: "Server Error Occur"
        });
    };
};

// toggle best seller
export const toggleBestSeller = async (req, res) => {
    try {
        const { product_id } = req.params;

        const product = await Product.findById(product_id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // flip whatever current value is
        product.isBestSeller = !product.isBestSeller;
        await product.save();

        return res.status(200).json({
            success: true,
            message: `Product ${product.isBestSeller ? "marked as" : "removed from"} Best Seller`,
            data: {
                _id: product._id,
                prodName: product.prodName,
                isBestSeller: product.isBestSeller
            }
        });

    } catch (err) {
        console.error("Toggle Best Seller Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// all orders
export const getAllOrders = async (req, res) => {
    try {
        const { vendorId, status, search, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Stage 1: base match (status + vendorId scope)
        const baseMatch = {};
        if (status) baseMatch.orderStatus = status;
        if (vendorId) {
            const vendorProducts = await Product.find({ vendorId }).distinct('_id');
            baseMatch['items.productId'] = { $in: vendorProducts };
        }

        const searchRegex = search ? new RegExp(search, 'i') : null;

        const pipeline = [
            { $match: baseMatch },

            // Stage 2: lookup user (customer)
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },

            // Stage 3: unwind items to search by product
            { $unwind: { path: '$items', preserveNullAndEmptyArrays: true } },

            // Stage 4: lookup product
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'items.productInfo'
                }
            },
            { $unwind: { path: '$items.productInfo', preserveNullAndEmptyArrays: true } },

            // get cat name
            {
                $lookup: {
                    from: 'categories',
                    localField: 'items.productInfo.catId',
                    foreignField: '_id',
                    as: 'items.catInfo'
                }
            },
            {
                $unwind: {
                    path: '$items.catInfo',
                    preserveNullAndEmptyArrays: true
                }
            },

            // Stage 5: search match
            ...(searchRegex ? [{
                $match: {
                    $or: [
                        { orderStatus: searchRegex },
                        { 'userInfo.name': searchRegex },
                        { 'items.productInfo.prodName': searchRegex }
                    ]
                }
            }] : []),

            // Stage 6: regroup items back per order
            {
                $group: {
                    _id: '$_id',
                    orderStatus: { $first: '$orderStatus' },
                    paymentStatus: { $first: '$paymentStatus' },
                    paymentMethod: { $first: '$paymentMethod' },
                    totalAmount: { $first: '$totalAmount' },
                    createdAt: { $first: '$createdAt' },
                    userInfo: { $first: '$userInfo' },
                    shippingAddress: { $first: '$shippingAddress' },
                    transactionId: { $first: '$transactionId' },
                    items: {
                        $push: {
                            productId: '$items.productId',
                            productInfo: '$items.productInfo',
                            catInfo: '$items.catInfo',
                            selectedColor: '$items.selectedColor',
                            selectedSize: '$items.selectedSize',
                            variantId: '$items.variantId',
                            quantity: '$items.quantity',
                            price: '$items.price'
                        }
                    }
                }
            },

            { $sort: { createdAt: -1 } },

            // Stage 7: facet for count + paginated data
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    data: [
                        { $skip: skip },
                        { $limit: parseInt(limit) }
                    ]
                }
            }
        ];

        const result = await Order.aggregate(pipeline);

        const count = result[0]?.total[0]?.count || 0;
        const totalPages = Math.ceil(count / parseInt(limit));
        const orders = result[0]?.data || [];

        console.log("First order:", JSON.stringify(orders[0], null, 2));

        res.status(200).json({
            success: true,
            count,
            totalPages,
            data: orders
        });

    } catch (err) {
        console.error("Admin Orders Error: ", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders"
        });
    }
};

// all users
export const getUserList = async (req, res) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const searchRegex = search ? new RegExp(search, 'i') : null;

        const matchStage = {};
        if (status === 'active') matchStage.isActive = true;
        if (status === 'inactive') matchStage.isActive = false;
        if (searchRegex) {
            matchStage.$or = [
                { name: searchRegex },
                { email: searchRegex }
            ];
        }

        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "userId",
                    as: "userOrders"
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    profilePhoto: 1,
                    isActive: 1,
                    createdAt: 1,
                    role: 1,
                    orderCount: { $size: "$userOrders" }
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    data: [
                        { $skip: skip },
                        { $limit: parseInt(limit) }
                    ]
                }
            }
        ];

        const result = await User.aggregate(pipeline);

        res.status(200).json({
            success: true,
            count: result[0]?.total[0]?.count || 0,
            totalPages: Math.ceil((result[0]?.total[0]?.count || 0) / parseInt(limit)),
            data: result[0]?.data || []
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// toggle user status
export const toggleUserStatus = async (req, res) => {
    try {
        const { user_id } = req.params;
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User is now ${user.isActive ? 'Active' : 'Inactive'}`,
            data: user
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// delete user
export const deleteUser = async (req, res) => {
    try {
        const { user_id } = req.params;

        const user = await User.findById(user_id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.profilePhoto) {
            await deleteOldFileFromCloudinary(user.profilePhoto);
        }

        await User.findByIdAndDelete(user_id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// review list
export const adminReviewList = async (req, res) => {
    try {
        const { status, vendorId, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let query = {};
        if (status) query.status = status;

        if (vendorId) {
            const vendorProducts = await Product.find({ vendorId }).select('_id');
            const productIds = vendorProducts.map(p => p._id);

            if (productIds.length === 0) {
                return res.status(200).json({
                    success: true,
                    count: 0,
                    totalPages: 0,
                    data: []
                });
            }
            query.productId = { $in: productIds };
        }

        const [reviews, count] = await Promise.all([
            ReviewRating.find(query)
                .populate('userId', 'name email profilePhoto')
                .populate({
                    path: 'productId',
                    select: 'prodName vendorId',
                    populate: { path: 'vendorId', select: 'name email profilePhoto' }
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            ReviewRating.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / parseInt(limit)),
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

// update review status
export const updateReviewStatus = async (req, res) => {
    try {
        const { review_id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Approved', 'Rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Use pending, approved, or rejected."
            });
        }

        const updatedReview = await ReviewRating.findByIdAndUpdate(
            review_id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedReview) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        if (ReviewRating.calculateAvgRating) {
            await ReviewRating.calculateAvgRating(updatedReview.productId);
        }

        res.status(200).json({
            success: true,
            message: `Review status updated to ${status} successfully`,
            data: updatedReview
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Error updating status"
        });
    }
};

// delete review
export const deleteReview = async (req, res) => {
    try {
        const { review_id } = req.params;

        const review = await ReviewRating.findByIdAndDelete(review_id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Rating recalculate karo (Kyuki review hat gaya hai)
        if (ReviewRating.calculateAvgRating) {
            await ReviewRating.calculateAvgRating(review.productId);
        }

        res.status(200).json({
            success: true,
            message: "Review deleted successfully and product rating updated"
        });

    } catch (err) {
        console.error("Error deleting review:", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// all transactions
export const getAllTransactions = async (req, res) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const searchRegex = search ? new RegExp(search, 'i') : null;

        const pipeline = [
            // Stage 1: lookup vendor
            {
                $lookup: {
                    from: 'vendors',
                    localField: 'vendorId',
                    foreignField: '_id',
                    as: 'vendorInfo'
                }
            },
            { $unwind: { path: '$vendorInfo', preserveNullAndEmptyArrays: true } },

            // Stage 2: lookup order
            {
                $lookup: {
                    from: 'orders',
                    localField: 'orderId',
                    foreignField: '_id',
                    as: 'orderInfo'
                }
            },
            { $unwind: { path: '$orderInfo', preserveNullAndEmptyArrays: true } },

            // Stage 3: status filter
            ...(status ? [{ $match: { status } }] : []),

            // Stage 4: search
            ...(searchRegex ? [{
                $match: {
                    $or: [
                        { transactionId: searchRegex },
                        { status: searchRegex },
                        { 'vendorInfo.name': searchRegex }
                    ]
                }
            }] : []),

            { $sort: { createdAt: -1 } },

            {
                $facet: {
                    total: [{ $count: 'count' }],
                    data: [
                        { $skip: skip },
                        { $limit: parseInt(limit) }
                    ]
                }
            }
        ];

        const result = await Transaction.aggregate(pipeline);

        const count = result[0]?.total[0]?.count || 0;
        const totalPages = Math.ceil(count / parseInt(limit));

        console.log("First txn:", JSON.stringify(result[0]?.data[0], null, 2));

        res.status(200).json({
            success: true,
            count,
            totalPages,
            data: result[0]?.data || []
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur",
        });
    }
};

// toggle transaction status
export const toggleTransactionStatus = async (req, res) => {
    try {
        const { transaction_id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Status"
            });
        }

        const transaction = await Transaction.findById(transaction_id);
        if (!transaction)
            return res.status(404).json({
                success: false,
                message: "Not found"
            });

        // Condition: Agar already Processed hai toh block kar do
        if (transaction.status === 'Completed') {
            return res.status(400).json({
                success: false,
                message: "Already settled!"
            });
        }

        // ====================================================
        // NEW LOGIC: Agar Admin 'Completed' select kare, 
        // toh vendor ka balance update karo
        // ====================================================
        if (status === 'Completed') {
            await Vendor.findByIdAndUpdate(transaction.vendorId, {
                $inc: { availableBalance: transaction.netEarning }
            });
        }
        // ====================================================

        transaction.status = status;
        await transaction.save();

        res.status(200).json({
            success: true,
            message: `Transaction marked as ${status}`,
            data: transaction
        });

    } catch (err) {
        console.log("Error :", err)
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// all withdrwal req
export const getAllWithdrawRequests = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (status) query.status = status;

        const [requests, count] = await Promise.all([
            Withdraw.find(query)
                .populate('vendorId', 'name email storeName availableBalance')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Withdraw.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            count,
            totalPages: Math.ceil(count / parseInt(limit)),
            data: requests
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// toggle withdraw req status
export const toggleWithdrawStatus = async (req, res) => {
    try {
        const { withdraw_id } = req.params;
        const { status, utrNumber, adminNote } = req.body;

        const validStatuses = ['Processing', 'Approved', 'Rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Status"
            });
        }

        const withdraw = await Withdraw.findById(withdraw_id);
        if (!withdraw)
            return res.status(404).json({
                success: false,
                message: "Request Not found"
            });

        // Condition: Agar already Processed hai toh block kar do
        if (withdraw.status === 'Approved' || withdraw.status === 'Rejected') {
            return res.status(400).json({
                success: false,
                message: "Status already finalized!"
            });
        }

        // ====================================================
        // NEW LOGIC: Agar Admin 'Reject' select kare, 
        // toh vendor ka balance plus me update karo
        // ====================================================
        if (status === 'Rejected') {
            const refundAmount = Number(withdraw.amount);
            await Vendor.findByIdAndUpdate(withdraw.vendorId, {
                $inc: { availableBalance: refundAmount }
            });
        }
        // ====================================================

        // Status aur Admin fields update karein
        withdraw.status = status;
        if (utrNumber) withdraw.utrNumber = utrNumber; // Withdraw History ke liye
        if (adminNote) withdraw.adminNote = adminNote;

        await withdraw.save();

        res.status(200).json({
            success: true,
            message: `Withdrawal request marked as ${status}`,
            data: withdraw
        });

    } catch (err) {
        console.log("Error :", err)
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// blog list 
export const listBlog = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } },
                    { tags: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Blog.countDocuments(query);

        const blogList = await Blog.find(query)
            .select("title category status createdAt bannerImage authorType authorCustomName readTime description content blockquote tags trendsList isActive")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        if (!blogList || blogList.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No blogs found",
                count: 0,
                totalPages: 0,
                currentPage: Number(page),
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Blog list successfully fetched",
            count: total,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            data: blogList
        });

    } catch (err) {
        console.log("Error : ", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// toggle blog status 
export const updateBlogStatus = async (req, res) => {
    try {
        const { blog_id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Approved', 'Rejected'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const blog = await Blog.findByIdAndUpdate(
            blog_id,
            { status },
            { new: true }
        );

        if (!blog)
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });

        return res.status(200).json({
            success: true,
            message: `Blog status updated to ${status} successfully`,
            data: blog
        });

    } catch (err) {
        console.log("Error :", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// delete blog
export const deleteBlog = async (req, res) => {
    try {
        const { blog_id } = req.params;
        const userId = req.user._id || req.user.id;
        const role = req.user?.role;

        const blog = await Blog.findById(blog_id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        const blogAuthorId = blog?.authorId || blog?.author;

        if (role !== 'Admin' && role !== 'admin' && blogAuthorId?.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this blog"
            });
        }

        if (blog.bannerImage) {
            await deleteOldFileFromCloudinary(blog.bannerImage);
        }

        await Blog.findByIdAndDelete(blog_id);

        res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occurred"
        });
    }
};

// dashboard search
export const adminSearch = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                message: 'Query must be at least 2 characters'
            });
        }

        const query = q.trim();
        const isValidId = mongoose.Types.ObjectId.isValid(query);

        const [products, orders] = await Promise.all([
            Product.find({
                $or: [
                    { prodName: { $regex: query, $options: 'i' } },
                    { status: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                ]
            })
                .select('prodName prodImage price originalPrice stock status description attributes variants isActive vendorId')
                .limit(5)
                .lean(),

            Order.find({
                $or: [
                    { 'shippingAddress.name': { $regex: query, $options: 'i' } },
                    { orderStatus: { $regex: query, $options: 'i' } },
                    ...(isValidId ? [{ _id: new mongoose.Types.ObjectId(query) }] : []),
                ]
            })
                .select('_id orderStatus shippingAddress paymentStatus paymentMethod items totalAmount createdAt isActive')
                .populate('items.productId', 'prodName prodImage price')
                .limit(5)
                .lean(),
        ]);

        return res.status(200).json({
            status: true,
            products,
            orders
        });

    } catch (error) {
        console.error('Admin search error:', error);
        return res.status(500).json({
            status: false,
            message: 'Server Error Occurred'
        });
    }
};