
import Vendor from "../Models/vendorModelSchema.js";
import OTP from '../Models/otpModel.js';
import Product from '../Models/productModelSchema.js';
import Order from '../Models/orderModelSchema.js';
import Category from '../Models/categoryModelSchema.js';
import User from '../Models/userModelSchema.js';

import mongoose from 'mongoose';
import sendEmail from "../utils/sendEmail.js";
import { deleteCloudinaryFiles, deleteOldFileFromCloudinary } from '../utils/cloudinaryUtils.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createAdminNotification } from "../utils/createAdminNotifications.js";

export const vendorSignUp = async (req, res) => {
    try {
        // Files path
        const profilePhoto = req.files['profilePhoto']?.[0]?.path;
        const storeLogo = req.files['storeLogo']?.[0]?.path;
        const categoryLicenseUpload = req.files['categoryLicenseUpload']?.[0]?.path || "";
        const panCardUpload = req.files['panCardUpload']?.[0]?.path;
        const gstDocumentUpload = req.files['gstDocumentUpload']?.[0]?.path || "";
        const bankDocumentUpload = req.files['bankDocumentUpload']?.[0]?.path;

        const {
            name, email, contact, password, storeName, aboutShop, businessEmail, businessContact, businessType,
            category, address, city, state, pincode, businessPAN,
            gstNumber, accHolder, bank, accNumber, ifsc
        } = req.body;

        const categoryData = await Category.findOne({ catName: category });

        if (!categoryData) {
            if (req.files) await deleteCloudinaryFiles(req.files);
            return res.status(404).json({
                success: false,
                message: "Selected category not found"
            });
        }

        if (categoryData.requiresCertificate && !categoryLicenseUpload) {
            if (req.files) await deleteCloudinaryFiles(req.files);
            return res.status(400).json({
                success: false,
                message: `Category License is mandatory for ${category}. (${categoryData.certificateLabel})`
            });
        }

        if (!profilePhoto || !name || !email || !contact || !password || !storeLogo || !storeName || !aboutShop || !businessEmail || !businessContact || !businessType || !category || !address || !city || !state || !pincode || !businessPAN || !panCardUpload || !accHolder || !bank || !accNumber || !ifsc || !bankDocumentUpload) {

            if (req.files) await deleteCloudinaryFiles(req.files);

            return res.status(400).json({
                success: false,
                message: "Please fill all the mandatory fields"
            })
        }

        // Conditiona GST Check 
        if (gstNumber && !gstDocumentUpload) {
            await deleteCloudinaryFiles(req.files);
            return res.status(400).json({
                success: false,
                message: `GST certificate is mandatory.`
            });
        }

        // const isEmailExist = await Vendor.findOne({ email });
        const isEmailExist = await Vendor.findOne({
            $or: [{ email: email }, { businessEmail: businessEmail }]
        });

        if (isEmailExist) {
            if (req.files) await deleteCloudinaryFiles(req.files);

            return res.status(400).json({
                success: false,
                message: "This email is already registered"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const vendor = await Vendor.create({
            profilePhoto,
            name,
            email,
            contact,
            password: hashedPassword,
            storeLogo,
            storeName,
            aboutShop,
            businessEmail,
            businessContact,
            businessType,
            category,
            categoryLicenseUpload,
            address,
            city,
            state,
            pincode,
            businessPAN,
            panCardUpload,
            gstNumber,
            gstDocumentUpload,
            accHolder,
            bank,
            accNumber,
            ifsc,
            bankDocumentUpload
        });

        // notify to admin
        await createAdminNotification({
            type: 'NEW_VENDOR',
            title: 'New Vendor Registration',
            message: `${vendor.storeName} (${vendor.name}) has applied to become a vendor`,
            relatedId: vendor._id
        });

        await OTP.deleteMany({ email, role: 'vendor' });

        // welcome mail
        const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ec4899, #f43f5e); padding: 30px 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px;">EasyShop</h1>
            <p style="color: #ffe4f0; margin: 5px 0 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Seller Central</p>
        </div>

        <!-- Body -->
        <div style="border: 1px solid #f9a8d4; border-top: none; border-radius: 0 0 12px 12px; padding: 30px 25px;">
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${vendor.name}, Welcome Aboard! 🎉</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Thank you for registering as a vendor on <strong style="color: #ec4899;">EasyShop</strong>. Your application has been received and is currently under review by our admin team.
            </p>

            <!-- Store Details -->
            <div style="background-color: #fdf2f8; border-left: 4px solid #ec4899; padding: 15px 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 6px 0; color: #1e293b; font-size: 14px;"><strong>Store Name:</strong> ${vendor.storeName}</p>
                <p style="margin: 6px 0; color: #1e293b; font-size: 14px;"><strong>Email:</strong> ${vendor.email}</p>
                <p style="margin: 6px 0; color: #1e293b; font-size: 14px;"><strong>Category:</strong> ${vendor.category}</p>
                <p style="margin: 6px 0; font-size: 14px;">
                    <strong>Status:</strong> 
                    <span style="color: #f59e0b; font-weight: bold; background-color: #fef3c7; padding: 2px 10px; border-radius: 20px; font-size: 12px;">Pending Approval</span>
                </p>
            </div>

            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                Our team will review your documents and get back to you within <strong>24-48 hours</strong>. You will receive an email once your account is approved.
            </p>

            <!-- What's Next -->
            <div style="background-color: #f8fafc; padding: 15px 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px; color: #1e293b; font-weight: bold; font-size: 14px;">What happens next?</p>
                <p style="margin: 5px 0; color: #475569; font-size: 13px;">✅ Admin reviews your documents</p>
                <p style="margin: 5px 0; color: #475569; font-size: 13px;">✅ Account gets approved</p>
                <p style="margin: 5px 0; color: #475569; font-size: 13px;">✅ You receive approval email</p>
                <p style="margin: 5px 0; color: #475569; font-size: 13px;">✅ Start listing your products</p>
            </div>

            <p style="color: #475569; font-size: 14px;">If you have any questions, feel free to contact our support team.</p>

            <p style="color: #1e293b; font-size: 14px;">Thanks, <br/><strong style="color: #ec4899;">EasyShop Team</strong></p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 20px;">
            <p style="color: #94a3b8; font-size: 11px;">© 2025 EasyShop. All rights reserved.</p>
        </div>

    </div>
`;
        sendEmail(vendor.email, "Welcome to EasyShop Seller Central!", emailHtml);

        return res.status(201).json({
            success: true,
            message: "Registered successfully",
            data: {
                id: vendor._id,
                name: vendor.name,
                store: vendor.storeName
            }
        })

    } catch (err) {
        if (req.files) {
            await deleteCloudinaryFiles(req.files);
        }

        console.error("Signup Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const vendorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
        }

        const vendor = await Vendor.findOne({ email });
        if (!vendor) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

        if (!vendor.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account is deactivated by Admin. Please contact support."
            });
        }

        const isMatch = await bcrypt.compare(password, vendor.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

        const token = jwt.sign({ id: vendor._id, role: vendor.role }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
        res.status(200).json({
            success: true,
            message: `Welcome back, ${vendor.name}`,
            token,
            vendor: vendor
        });
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const vendor = await Vendor.findOne({ email });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Email does not exist"
            });
        }

        const secret = process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ id: vendor._id, role: vendor.role }, secret, { expiresIn: '15m' });

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const link = `${frontendUrl}/reset_password/${vendor._id}/${token}?role=vendor`;

        try {
            await sendEmail(
                email,
                "Password Reset Request",
                `<h2>EasyShop Password Reset</h2>
                 <p>Click the button below to reset your password. This link expires in 15 minutes.</p>
                 <a href="${link}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                 <p>If you didn't request this, please ignore this email.</p>`
            );

            return res.status(200).json({
                success: true,
                message: "Password reset link sent to your email.",
                link
            });

        } catch (mailErr) {
            return res.status(500).json({
                success: false,
                message: "Error sending email"
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { vendor_id, token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return res.status(404).json({
                success: false,
                message: "New Password and Confirm Password are required"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        const vendor = await Vendor.findById(vendor_id);

        if (!vendor) {
            return res.status(400).json({
                success: false,
                message: "Vendor not found"
            });
        }

        const secret = process.env.JWT_SECRET_KEY;
        try {
            jwt.verify(token, secret);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Link expired or invalid"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        vendor.password = hashedPassword;
        await vendor.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. You can login now."
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters"
            });
        }

        const vendor = await Vendor.findById(req.user.id);

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found"
            });
        }

        // verify old password is correct
        const isMatch = await bcrypt.compare(oldPassword, vendor.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // hash and save new password
        const salt = await bcrypt.genSalt(10);
        vendor.password = await bcrypt.hash(newPassword, salt);
        await vendor.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (err) {
        console.log("Error :", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const countVendor = async (req, res) => {
    try {
        const count = await Vendor.countDocuments();

        res.status(200).json({
            success: true,
            message: "Vendors Count",
            totalCount: count
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const getVendor = async (req, res) => {
    try {
        const vendorId = (req.user.role === 'admin' && req.params.vendorId)
            ? req.params.vendorId
            : req.user.id;

        const vendor = await Vendor.findById(vendorId).select("-password");

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor detail not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Vendor Detail",
            data: vendor
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

export const updateVendorDetail = async (req, res) => {
    try {
        const vendor_id = req.user.id;
        const currentVendor = await Vendor.findById(vendor_id);

        if (!currentVendor) {
            return res.status(404).json({ success: false, message: "Vendor not found" });
        }

        const updates = {};
        const fields = ['name', 'contact', 'storeName', 'aboutShop', 'businessEmail', 'businessContact', 'businessType', 'category', 'address', 'city', 'pincode', 'state', 'gstNumber', 'accHolder', 'bank', 'accNumber', 'ifsc'];

        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        // --- EMAIL UPDATE LOGIC ---
        let emailUpdatePending = false;
        const newEmail = req.body.email;

        if (newEmail && newEmail !== currentVendor.email) {
            const emailExists = await Vendor.findOne({ email: newEmail });
            if (emailExists) {
                return res.status(400).json({ success: false, message: "Email already registered" });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            await OTP.findOneAndUpdate(
                { email: newEmail, role: 'vendor' },
                { otp, role: 'vendor' },
                { upsert: true, new: true }
            );

            await sendEmail(newEmail, "Verify Your New Email", `Your OTP is: ${otp}`);
            emailUpdatePending = true;
        }

        // --- FILE UPDATE LOGIC ---
        if (req.files) {
            const fileFields = [
                'profilePhoto', 'storeLogo', 'categoryLicenseUpload',
                'panCardUpload', 'gstDocumentUpload', 'bankDocumentUpload'
            ];

            for (const field of fileFields) {
                if (req.files[field] && req.files[field][0]) {
                    if (currentVendor[field]) {
                        await deleteOldFileFromCloudinary(currentVendor[field]);
                    }
                    updates[field] = req.files[field][0].path;
                }
            }
        }

        // --- FINAL UPDATE ---
        const updatedVendor = await Vendor.findByIdAndUpdate(
            vendor_id,
            { $set: updates },
            { new: true }
        ).select("-password");

        if (emailUpdatePending) {
            return res.status(200).json({
                success: true,
                isEmailUpdatePending: true,
                newEmail: newEmail,
                data: updatedVendor,
                message: "Basic details updated. Please verify OTP for new email."
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile Updated!",
            data: updatedVendor
        });

    } catch (err) {
        if (req.files) await deleteCloudinaryFiles(req.files);
        console.log("Error :", err);
        res.status(500).json({ success: false, message: "Error" });
    }
};

export const vendorLogout = async (req, res) => {
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

// dashboard search bar 
export const vendorSearch = async (req, res) => {
    try {
        const vendorId = req.user._id || req.user.id;
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                message: 'Query must be at least 2 characters'
            });
        }

        const query = q.trim();

        const products = await Product.find({
            vendorId,
            isActive: true,
            $or: [
                { prodName: { $regex: query, $options: 'i' } },
                { status: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
            ]
        })
            .select('prodName prodImage price originalPrice stock status description attributes variants isActive')
            .limit(5)
            .lean();

        const isValidId = mongoose.Types.ObjectId.isValid(query);

        const orders = await Order.find({
            'items.vendorId': vendorId,
            isActive: true,
            $or: [
                { 'shippingAddress.name': { $regex: query, $options: 'i' } },
                { orderStatus: { $regex: query, $options: 'i' } },
                ...(isValidId ? [{ _id: new mongoose.Types.ObjectId(query) }] : []),
            ]
        })

        return res.status(200).json({ products, orders });

    } catch (error) {
        console.error('Vendor search error:', error);
        return res.status(500).json({
            message: 'Server Error Occur'
        });
    }
};

// dashboard stats
export const vendorDashboardStats = async (req, res) => {
    try {
        // Convert string ID to MongoDB ObjectId
        const vId = new mongoose.Types.ObjectId(req.user.id);

        // 1. Get Product Stats based on schema field names
        const productStats = await Product.aggregate([
            {
                $match: {
                    vendorId: vId // Matches 'vendorId' in schema
                }
            },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    activeProducts: {
                        $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] }
                    },
                    avgRating: { $avg: "$averageRating" }
                }
            }
        ]);

        // 2. Get Total Revenue from Orders
        const revenueStats = await Order.aggregate([
            // 1. Split the array so we can check each item individually
            { $unwind: "$items" },

            // 2. Join with Products to see who owns which item
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "itemDetails"
                }
            },
            { $unwind: "$itemDetails" },

            // 3. Filter by Vendor ID
            {
                $match: {
                    "itemDetails.vendorId": vId,
                    // To see ALL money (even pending), comment out the line below:
                    "orderStatus": { $in: ["Delivered", "Shipped", "Processing"] }
                }
            },

            // 4. Sum ONLY the items belonging to THIS vendor
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: { $multiply: ["$items.price", "$items.quantity"] }
                    },
                    count: { $sum: 1 } // To see how many items were found
                }
            }
        ]);

        // 3. Format result for the frontend
        const stats = {
            totalRevenue: revenueStats[0]?.totalRevenue || 0,
            totalProds: productStats[0]?.totalProducts || 0,
            activeProds: productStats[0]?.activeProducts || 0,
            avgRating: parseFloat(productStats[0]?.avgRating?.toFixed(1)) || 0
        };

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (err) {
        console.error("Error : ", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occurred"
        });
    }
};

// Orders Over Time 
export const vendorOrdersOverTime = async (req, res) => {
    try {
        const vId = new mongoose.Types.ObjectId(req.user.id);
        const days = parseInt(req.query.period) || 30;
        const since = new Date();
        since.setDate(since.getDate() - days);

        const data = await Order.aggregate([
            { $unwind: "$items" },
            {
                $match: {
                    "items.vendorId": vId,
                    "orderStatus": { $in: ["Delivered", "Shipped", "Processing"] },
                    "createdAt": { $gte: since }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", count: 1, revenue: 1 } }
        ]);

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("Error [vendorOrdersOverTime]:", err);
        res.status(500).json({ success: false, message: "Server Error Occurred" });
    }
};

// Order Status Breakdown
export const vendorOrderStatus = async (req, res) => {
    try {
        const vId = new mongoose.Types.ObjectId(req.user.id);

        const data = await Order.aggregate([
            { $unwind: "$items" },
            { $match: { "items.vendorId": vId } },
            // De-duplicate: one order may have multiple vendor items
            { $group: { _id: { orderId: "$_id", status: "$orderStatus" } } },
            { $group: { _id: "$_id.status", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { _id: 0, status: "$_id", count: 1 } }
        ]);

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("Error [vendorOrderStatus]:", err);
        res.status(500).json({ success: false, message: "Server Error Occurred" });
    }
};

// Top Selling Products
export const vendorTopProducts = async (req, res) => {
    try {
        const vId = new mongoose.Types.ObjectId(req.user.id);
        const limit = parseInt(req.query.limit) || 5;

        const data = await Order.aggregate([
            { $unwind: "$items" },
            {
                $match: {
                    "items.vendorId": vId,
                    "orderStatus": { $in: ["Delivered", "Shipped", "Processing"] }
                }
            },
            {
                $group: {
                    _id: "$items.productId",
                    unitsSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { unitsSold: -1 } },
            { $limit: limit },

            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 0,
                    productId: "$_id",
                    name: "$product.prodName",
                    image: "$product.prodImage",
                    unitsSold: 1,
                    revenue: 1
                }
            }
        ]);

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("Error [vendorTopProducts]:", err);
        res.status(500).json({ success: false, message: "Server Error Occurred" });
    }
};

// vendor's customer
export const getVendorCustomers = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { search = '', page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skipNum = (pageNum - 1) * limitNum;

        // Base matching stage to keep operations performance-focused
        const initialPipeline = [
            { $unwind: "$items" },
            {
                $match: { "items.vendorId": new mongoose.Types.ObjectId(vendorId) }
            },
            {
                $group: {
                    _id: "$userId",
                    lastOrderDate: { $max: "$createdAt" },
                    totalSpend: {
                        $sum: { $multiply: ["$items.price", "$items.quantity"] }
                    },
                    totalOrders: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" }
        ];

        // Search conditions (Runs after userDetails are combined)
        if (search.trim()) {
            initialPipeline.push({
                $match: {
                    $or: [
                        { "userDetails.name": new RegExp(search.trim(), 'i') },
                        { "userDetails.email": new RegExp(search.trim(), 'i') }
                    ]
                }
            });
        }

        // Final Projection and Sorting criteria
        initialPipeline.push(
            {
                $project: {
                    _id: 1,
                    profilePhoto: "$userDetails.profilePhoto",
                    name: "$userDetails.name",
                    email: "$userDetails.email",
                    contact: "$userDetails.contact",
                    state: "$userDetails.state",
                    isActive: "$userDetails.isActive",
                    lastOrderDate: 1,
                    totalSpend: 1,
                    totalOrders: 1
                }
            },
            { $sort: { lastOrderDate: -1 } }
        );

        // Execute concurrent tracking for counts and pagination using $facet
        const aggregationResult = await Order.aggregate([
            ...initialPipeline,
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [{ $skip: skipNum }, { $limit: limitNum }]
                }
            }
        ]);

        const total = aggregationResult[0]?.metadata[0]?.total || 0;
        const customers = aggregationResult[0]?.data || [];

        return res.status(200).json({
            success: true,
            count: total,
            totalPages: Math.ceil(total / limitNum),
            data: customers
        });

    } catch (err) {
        console.error("Error: ", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occurred"
        });
    }
};

// vendor's customer stats
export const getVendorCustomerStats = async (req, res) => {
    try {
        const vendorId = req.user.id;

        const stats = await Order.aggregate([
            { $unwind: "$items" },
            { $match: { "items.vendorId": new mongoose.Types.ObjectId(vendorId) } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $group: {
                    _id: null,
                    // Sabhi unique customers
                    allUniqueCustomers: { $addToSet: "$userId" },
                    // Sirf wahi customers jo active hain
                    activeCustomers: {
                        $addToSet: {
                            $cond: [{ $eq: ["$userDetails.isActive", true] }, "$userId", null]
                        }
                    },
                    totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalCustomers: { $size: "$allUniqueCustomers" },
                    // Null values hatakar sirf active users ka count
                    activeNow: {
                        $size: {
                            $filter: {
                                input: "$activeCustomers",
                                as: "id",
                                cond: { $ne: ["$$id", null] }
                            }
                        }
                    },
                    avgSpend: {
                        $cond: [
                            { $eq: [{ $size: "$allUniqueCustomers" }, 0] },
                            0,
                            { $divide: ["$totalRevenue", { $size: "$allUniqueCustomers" }] }
                        ]
                    }
                }
            }
        ]);

        const result = stats.length > 0 ? stats[0] : {
            totalCustomers: 0,
            activeNow: 0,
            avgSpend: 0
        };

        res.status(200).json({
            success: true,
            message: "Here is stats data",
            data: result
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// vendor's cutomer profile
export const getCustomerDetailsForVendor = async (req, res) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.id;

        // 1.user detail
        const user = await User.findById(id)
            .select("name email contact profilePhoto city isActive createdAt");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // 2. customer order history
        const orders = await Order.find({
            userId: id,
            "items.vendorId": vendorId
        }).sort({ createdAt: -1 });

        // 3. Financial Metrics Calculation
        const totalSpend = orders.reduce((acc, order) => {
            const vendorItems = order.items.filter(item => item.vendorId.toString() === vendorId);
            const orderSum = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            return acc + orderSum;
        }, 0);

        const avgOrderValue = orders.length > 0 ? (totalSpend / orders.length).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            message: "Here is customer profile",
            data: {
                profile: {
                    ...user._doc,
                    customerSince: user.createdAt,
                },
                metrics: {
                    totalOrders: orders.length,
                    totalSpend: totalSpend,
                    avgOrderValue: avgOrderValue
                },
                orders: orders
            }
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};