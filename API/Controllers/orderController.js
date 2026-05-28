
import Order from '../Models/orderModelSchema.js';
import Cart from '../Models/cartModelSchema.js';
import Product from '../Models/productModelSchema.js';
import Transaction from '../Models/transactionModelSchema.js';
import Vendor from '../Models/vendorModelSchema.js';

import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import sendEmail from '../utils/sendEmail.js';

import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// helper function for both place orders
const findMatchingVariant = (product, selectedColor, selectedSize) => {
    const hasColor = product.attributes?.get?.('Color')?.values?.length > 0;
    const hasSize = product.attributes?.get?.('Size')?.values?.length > 0;

    return product.variants.find(v => {
        const colorMatch = hasColor
            ? v.color === selectedColor
            : v.color == null;

        const sizeMatch = hasSize
            ? v.size === selectedSize
            : v.size == null;

        return colorMatch && sizeMatch;
    });
};

// Step 1: Create Razorpay order (just creates payment session, no DB order yet)
export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        }

        const razorpayOrder = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (err) {
        console.log("Razorpay order creation error:", err);
        res.status(500).json({
            success: false,
            message: "Payment initiation failed"
        });
    }
};

// Step 2: Verify payment signature + save order to DB
export const verifyRazorpayPayment = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            cartData,
            orderType
        } = req.body;

        // 1. Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        // 2. Build orderItems from DB, not frontend
        let orderItems = [];
        let totalAmount = 0;

        if (orderType === 'cart') {
            const cart = await Cart.findOne({ userId }).populate('items.productId');

            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ success: false, message: "Cart is empty" });
            }

            for (const item of cart.items) {
                const product = item.productId;

                const variant = findMatchingVariant(
                    product,
                    item.selectedColor || null,
                    item.selectedSize || null
                );

                if (!variant) {
                    return res.status(400).json({ success: false, message: `Invalid variant for ${product.prodName}` });
                }

                orderItems.push({
                    productId: product._id,
                    vendorId: product.vendorId,
                    quantity: item.quantity,
                    price: product.price,
                    selectedColor: item.selectedColor || null,
                    selectedSize: item.selectedSize || null,
                    variantId: variant._id
                });

                totalAmount += product.price * item.quantity;
            }

        } else {
            // direct buy — get from cartData but fetch product for vendorId
            const { productId, quantity, selectedColor, selectedSize } = cartData.orderItems[0];
            const product = await Product.findById(productId);

            const variant = findMatchingVariant(product, selectedColor || null, selectedSize || null);

            orderItems.push({
                productId: product._id,
                vendorId: product.vendorId,
                quantity,
                price: product.price,
                selectedColor: selectedColor || null,
                selectedSize: selectedSize || null,
                variantId: variant._id
            });

            totalAmount = product.price * quantity;
        }

        // 3. Save order
        const newOrder = new Order({
            userId,
            items: orderItems,
            totalAmount,
            shippingAddress: cartData.shippingAddress,
            paymentMethod: 'Online',
            paymentStatus: 'Completed',
            orderStatus: 'Processing',
            transactionId: razorpay_payment_id
        });

        await newOrder.save();

        // 4. Update stock
        for (const item of orderItems) {
            await Product.updateOne(
                { _id: item.productId, "variants._id": item.variantId },
                {
                    $inc: {
                        stock: -item.quantity,
                        totalSold: item.quantity,
                        "variants.$.stock": -item.quantity
                    }
                }
            );
        }

        // 5. Clear cart
        if (orderType === 'cart') {
            await Cart.findOneAndDelete({ userId });
        }

        res.status(201).json({
            success: true,
            message: "Payment verified & order placed!",
            orderId: newOrder._id
        });

    } catch (err) {
        console.log("Payment verification error:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// check out
export const placeCartOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { shippingAddress, paymentMethod } = req.body;

        // 1. find user cart
        const cart = await Cart.findOne({ userId }).populate('items.productId');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty. You can,t place order."
            });
        }

        if (!shippingAddress.name || !shippingAddress.contact || !shippingAddress.pincode || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is mandatory"
            });
        }

        // 2. total amount cal
        let totalAmount = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const product = item.productId;

            // Check product delete toh nahi ho gaya ya stock kam toh nahi hai
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Some products are not available"
                });
            }

            // check total stock
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${product.prodName} out of stock. Only ${product.stock} remaining.`
                });
            }

            // check size stock if selectedSize exists
            const variant = findMatchingVariant(
                product,
                item.selectedColor || null,
                item.selectedSize || null
            );

            if (!variant) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid variant selected for ${product.prodName}`
                });
            }

            if (variant.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `${product.prodName} selected variant out of stock. Only ${variant.stock} remaining.`
                });
            }

            // prepare Order items array 
            orderItems.push({
                productId: product._id,
                vendorId: product.vendorId,
                quantity: item.quantity,
                price: product.price,
                selectedColor: item.selectedColor || null,
                selectedSize: item.selectedSize || null,
                variantId: variant._id
            });

            totalAmount += product.price * item.quantity;
        }

        // 3. Naya Order Create karo
        const newOrder = new Order({
            userId,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod: 'COD',        // only COD reaches here now
            paymentStatus: 'Pending',    // COD is always pending
            orderStatus: 'Processing'
        });

        await newOrder.save();

        // 4. stock update
        for (const item of orderItems) {
            await Product.updateOne(
                {
                    _id: item.productId,
                    "variants._id": item.variantId
                },
                {
                    $inc: {
                        stock: -item.quantity,
                        totalSold: item.quantity,
                        "variants.$.stock": -item.quantity
                    }
                }
            );
        }

        // 5. Cart Empty kar do
        await Cart.findOneAndDelete({ userId });

        res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            orderId: newOrder._id,
            data: newOrder
        });

    } catch (err) {
        console.log("Error : ", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// buy now
export const placeDirectOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { prod_id } = req.params;

        const { quantity, shippingAddress, paymentMethod, selectedColor, selectedSize } = req.body;

        // Check if shippingAddress exists before checking its properties
        if (!shippingAddress || !shippingAddress.name || !shippingAddress.contact || !shippingAddress.pincode || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state) {
            return res.status(400).json({
                success: false,
                message: "All shipping address fields are mandatory"
            });
        }

        const product = await Product.findById(prod_id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `${product?.prodName || "Product"} out of stock.`
            });
        }

        const variant = findMatchingVariant(
            product,
            selectedColor || null,
            selectedSize || null
        );

        if (!variant) {
            return res.status(400).json({
                success: false,
                message: "Invalid variant selected"
            });
        }

        if (variant.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Selected variant out of stock. Only ${variant.stock} remaining.`
            });
        }

        const newOrder = new Order({
            userId,
            items: [{
                productId: product._id,
                vendorId: product.vendorId,
                quantity,
                price: product.price,
                selectedColor: selectedColor || null,
                selectedSize: selectedSize || null,
                variantId: variant._id
            }],

            totalAmount: product.price * quantity,
            shippingAddress,
            paymentMethod: 'COD',        // only COD reaches here now
            paymentStatus: 'Pending',    // COD is always pending
            orderStatus: 'Processing'
        });

        await newOrder.save();

        // order placed then decrease quantity
        await Product.updateOne(
            {
                _id: prod_id,
                "variants._id": variant._id
            },
            {
                $inc: {
                    stock: -quantity,
                    totalSold: quantity,
                    "variants.$.stock": -quantity
                }
            }
        );

        await Cart.findOneAndUpdate(
            { userId },
            { $pull: { items: { productId: prod_id } } }
        );

        res.status(201).json({
            success: true,
            message: "Direct Order Placed!",
            data: newOrder
        });

    } catch (err) {
        console.log("Error : ", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// user
export const userOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, search = '', orderStatus = '' } = req.query;
        const skip = (page - 1) * limit;

        const query = { userId };
        if (orderStatus) query.orderStatus = orderStatus;

        let orders = await Order.find(query)
            .populate("items.productId", "prodName prodImage price attributes prodImages")
            .sort({ createdAt: -1 });

        if (search) {
            const s = search.toLowerCase();
            orders = orders.filter(order => {
                const idMatch = order._id.toString().slice(-6).toLowerCase().includes(s);
                const prodMatch = order.items.some(item =>
                    item.productId?.prodName?.toLowerCase().includes(s)
                );
                const statusMatch = order.orderStatus?.toLowerCase().includes(s);

                return idMatch || prodMatch || statusMatch;
            });
        }

        const total = orders.length;
        const paginated = orders.slice(skip, Number(skip) + Number(limit));

        res.status(200).json({
            success: true,
            count: total,
            totalPages: Math.ceil(total / limit),
            data: paginated
        });

    } catch (err) {
        console.log("Error : ", err);
        res.status(500).json({ success: false, message: "Server Error Occur" });
    }
};

// user
export const getSingleOrderDetail = async (req, res) => {
    try {
        const { order_id } = req.params;

        const order = await Order.findById(order_id)
            .populate('items.productId', 'prodImage prodName price quantity attributes variants')
            .populate('userId', 'name contact address');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Order details fetched successfully",
            data: order
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// user
export const cancelOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { order_id } = req.params;

        const order = await Order.findOne({ _id: order_id, userId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.orderStatus === "Shipped" || order.orderStatus === "Delivered") {
            return res.status(400).json({
                success: false,
                message: "Sorry, Delivered or Shipped orders can't be cancel."
            });
        }

        if (order.orderStatus === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Order already cancelled."
            });
        }

        order.orderStatus = "Cancelled";
        await order.save();

        // stock increase after cancel
        for (const item of order.items) {
            if (item.variantId) {
                // restore variant stock
                await Product.updateOne(
                    {
                        _id: item.productId,
                        "variants._id": item.variantId
                    },
                    {
                        $inc: {
                            stock: item.quantity,
                            totalSold: -item.quantity,
                            "variants.$.stock": item.quantity
                        }
                    }
                );
            } else {
                // no variant — just restore total stock
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { stock: item.quantity, totalSold: -item.quantity }
                });
            }
        }

        res.status(200).json({
            success: true,
            message: "Order successfully cancelled aur stock updated."
        });

    } catch (err) {
        console.log("ERROR :", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// user + vendor + admin
export const orderInvoiceDownload = async (req, res) => {
    try {
        const { order_id } = req.params;
        const user_id = req.user.id;
        const user_role = req.user.role;

        if (!order_id || order_id === 'undefined') {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing Order ID"
            });
        }

        const order = await Order.findById(order_id)
            .populate("items.productId")
            .populate("userId", "name email");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // --- FILTER LOGIC START ---
        let itemsToPrint = order.items;
        let totalAmountToPrint = order.totalAmount;

        // Agar requester 'vendor' hai, toh sirf uske apne items dikhao
        if (user_role === 'vendor') {
            itemsToPrint = order.items.filter(item =>
                item.vendorId?.toString() === user_id
            );

            // Vendor ke liye total bhi sirf uske items ka hoga
            totalAmountToPrint = itemsToPrint.reduce((acc, item) =>
                acc + (item.price * item.quantity), 0
            );
        }

        if (itemsToPrint.length === 0) {
            return res.status(403).json({
                success: false,
                message: "No items found for this vendor"
            });
        }
        // --- FILTER LOGIC END ---

        // 2. PDF Document setup karein
        const doc = new PDFDocument({ margin: 50 });

        // HTTP Headers set karein taaki browser ise download kare
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${order_id}.pdf`);

        // doc ko response stream se connect karein
        doc.pipe(res);

        // 3. Header: Logo aur Company Name
        doc.fillColor('#444444').fontSize(20).text('EasyShop', 50, 57);
        doc.fontSize(10).text('123 Business Park', 200, 65, { align: 'right' });
        doc.text('Indore, MP - 452001', 200, 80, { align: 'right' });
        doc.moveDown();

        // 4. Invoice Info
        doc.fillColor('#000').fontSize(20).text('INVOICE', 50, 160);
        doc.fontSize(10).text(`Invoice Number: ${order._id}`, 50, 200);
        doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 215);
        doc.text(`Total Amount: INR ${totalAmountToPrint}`, 50, 230);

        // 5. Customer Details
        doc.text(`Bill To:`, 300, 200);
        doc.text(order.userId.name, 300, 215);
        doc.text(order.shippingAddress.address, 300, 230);

        doc.moveDown();

        // 6. Table Header
        const tableTop = 300;
        doc.font('Helvetica-Bold');
        doc.text('Item', 50, tableTop);
        doc.text('Color', 180, tableTop);
        doc.text('Size', 230, tableTop);
        doc.text('Qty', 280, tableTop);
        doc.text('Price', 350, tableTop);
        doc.text('Total', 450, tableTop);
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Table Content
        let i = 0;
        itemsToPrint.forEach(item => {
            const y = tableTop + 30 + (i * 25);
            doc.font('Helvetica').text(item.productId.prodName, 50, y);
            doc.text(item.selectedColor || '-', 180, y);
            doc.text(item.selectedSize || '-', 230, y);
            doc.text(item.quantity.toString(), 280, y);
            doc.text(`INR ${item.price}`, 350, y);
            doc.text(`INR ${item.price * item.quantity}`, 450, y);
            i++;
        });

        // define footerTop AFTER loop
        const footerTop = tableTop + 30 + (itemsToPrint.length * 25) + 10;

        doc.moveTo(50, footerTop).lineTo(550, footerTop).stroke();
        doc.font('Helvetica-Bold');
        doc.text('Grand Total:', 350, footerTop + 10);
        doc.text(`INR ${totalAmountToPrint}`, 450, footerTop + 10);

        doc.fontSize(10).text('Thank you for shopping with EasyShop!', 50, 700, { align: 'center', width: 500 });

        doc.end();

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// vendor - order list
export const getVendorOrders = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { search = '', page = 1, limit = 10, orderStatus = '' } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const matchStage = {
            "productDetails.vendorId": new mongoose.Types.ObjectId(vendorId)
        };

        if (orderStatus.trim()) {
            matchStage.orderStatus = orderStatus;
        }

        const searchStage = search.trim() ? {
            $match: {
                $or: [
                    { "customerDetails.name": new RegExp(search.trim(), 'i') },
                    { "productDetails.prodName": new RegExp(search.trim(), 'i') },
                    { orderStatus: new RegExp(search.trim(), 'i') }
                ]
            }
        } : null;

        const basePipeline = [
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            { $match: matchStage },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "customerDetails"
                }
            },
            { $unwind: "$customerDetails" },
            ...(searchStage ? [searchStage] : []),
            {
                $addFields: {
                    colorImageEntry: {
                        $first: {
                            $filter: {
                                input: {
                                    $objectToArray: {
                                        $ifNull: ["$productDetails.attributes.Color.images", {}]
                                    }
                                },
                                as: "img",
                                cond: { $eq: ["$$img.k", "$items.selectedColor"] }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    variantImage: {
                        $ifNull: [
                            { $arrayElemAt: ["$colorImageEntry.v", 0] },
                            "$productDetails.prodImage"
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    orderStatus: 1,
                    createdAt: 1,
                    totalAmount: 1,
                    paymentStatus: 1,
                    paymentMethod: 1,
                    "items.quantity": 1,
                    "items.price": 1,
                    "items.selectedColor": 1,
                    "items.selectedSize": 1,
                    "items.variantId": 1,
                    variantImage: 1,
                    "productDetails.prodName": 1,
                    "productDetails.prodImage": 1,
                    "productDetails.price": 1,
                    "customerDetails.name": 1,
                    "customerDetails.email": 1,
                    "customerDetails.address": 1
                }
            },
            { $sort: { createdAt: -1 } }
        ];

        const [orders, countResult] = await Promise.all([
            Order.aggregate([...basePipeline, { $skip: skip }, { $limit: limitNum }]),
            Order.aggregate([...basePipeline, { $count: "total" }])
        ]);

        const total = countResult[0]?.total || 0;

        res.status(200).json({
            success: true,
            count: total,
            totalPages: Math.ceil(total / limitNum),
            data: orders
        });

    } catch (err) {
        console.log("Error : ", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// vendor
export const getVendorDashboardStats = async (req, res) => {
    try {
        const vendorId = req.user.role === 'admin' ? req.query.vendorId : req.user.id;

        if (!vendorId) {
            return res.status(400).json({
                success: false,
                message: "Vendor ID required"
            });
        }

        const vendorProducts = await Product.find({ vendorId: vendorId }).distinct('_id');

        const deliveredOrders = await Order.find({
            "items.productId": { $in: vendorProducts },
            orderStatus: "Delivered", paymentStatus: "Completed"
        });

        // specific vendor ka total revenue
        const vendorProductSet = new Set(vendorProducts.map(id => id.toString()));
        let totalRevenue = 0;

        deliveredOrders.forEach(order => {
            order.items.forEach(item => {
                if (vendorProductSet.has(item.productId.toString())) {
                    totalRevenue += item.price * item.quantity;
                }
            });
        });

        // Counts - Sabka criteria same hona chahiye
        const queryBase = { "items.productId": { $in: vendorProducts } };

        const totalOrders = await Order.countDocuments(queryBase);

        const pendingOrders = await Order.countDocuments({
            ...queryBase,
            orderStatus: { $in: ["Processing", "Shipped"] }
        });

        const cancelledOrders = await Order.countDocuments({
            ...queryBase,
            orderStatus: "Cancelled"
        });

        res.status(200).json({
            success: true,
            data: {
                vendorId,
                totalRevenue,
                totalOrders,
                pendingOrders,
                cancelledOrders
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

// vendor
export const getVendorSingleOrderDetail = async (req, res) => {
    try {
        const { order_id } = req.params;
        const vendor_id = req.user.id;

        const order = await Order.findById(order_id)
            .populate('userId', 'name email profilePhoto')
            .populate({
                path: 'items.productId',
                select: 'prodName prodImage price catId attributes variants',
                populate: {
                    path: 'catId',
                    select: 'catName'
                }
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Security Check
        const isOwnOrder = order.items.some(
            item => item.vendorId?.toString() === vendor_id
        );

        if (req.user.role !== 'admin' && !isOwnOrder) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only view your own orders"
            });
        }

        const finalOrder = order.toObject();

        finalOrder.items = order.items.map((item) => {
            const product = item.productId;
            const colorAttr = product?.attributes?.get?.("Color");

            const colorImages = item.selectedColor
                ? colorAttr?.images?.[item.selectedColor]
                : null;

            return {
                ...item.toObject(),
                variantImage: colorImages?.[0] || product?.prodImage
            };
        });

        res.status(200).json({
            success: true,
            message: "Here is Specific vendor's order deatil",
            data: finalOrder
        });

    } catch (err) {
        console.error("Error fetching order details:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// vendor
export const getOrderStats = async (req, res) => {
    try {
        const vendor_id = req.user.id;
        const userRole = req.user.role;

        let matchQuery = {};

        // Agar user 'vendor' hai, toh sirf uske products wale orders filter karo
        if (userRole === 'vendor') {
            matchQuery = { "items.vendorId": new mongoose.Types.ObjectId(vendor_id) };
        }

        const stats = await Order.aggregate([
            { $unwind: "$items" }, // Har item ko alag karo taaki vendor filter ho sake
            { $match: matchQuery },
            {
                $group: {
                    _id: "$orderStatus", // Status ke hisaab se group karo
                    count: { $sum: 1 }
                }
            }
        ]);

        // Data ko frontend-friendly format mein convert karein
        const formattedStats = {
            Pending: 0,
            Processing: 0,
            Shipped: 0,
            Delivered: 0,
            Cancelled: 0
        };

        stats.forEach(item => {
            if (formattedStats.hasOwnProperty(item._id)) {
                formattedStats[item._id] = item.count;
            }
        });

        res.status(200).json({
            success: true,
            message: "Stats fetched successfully",
            data: formattedStats
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// admin + vendor : order tracking (user) + update order status (admin + vendor)
export const updateOrderStatus = async (req, res) => {
    try {
        const { order_id } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const order = await Order.findById(order_id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // --- NEW FIX: Same Status Check ---
        // Agar status already wahi hai jo hum update kar rahe hain, toh return kar do
        if (order.orderStatus === status) {
            return res.status(200).json({
                success: true,
                message: `Order is already marked as ${status}`,
                data: order
            });
        }
        // ----------------------------------

        // Prevent updates on finalized orders
        if (order.orderStatus === "Cancelled" || order.orderStatus === "Delivered") {
            return res.status(400).json({
                success: false,
                message: `Cannot update a ${order.orderStatus} order.`
            });
        }

        // Vendor ownership check
        if (req.user.role !== 'admin') {
            const hasVendorProduct = order.items.some(item =>
                item.vendorId?.toString() === req.user.id
            );
            if (!hasVendorProduct) {
                return res.status(403).json({
                    success: false,
                    message: "Access Denied"
                });
            }
        }

        // Vendor authority limit
        if (req.user.role === 'vendor' && !['Processing', 'Shipped', 'Cancelled'].includes(status)) {
            return res.status(403).json({
                success: false,
                message: "Vendor can only mark as Processing, Shipped or Cancelled"
            });
        }

        // Only admin can mark Delivered
        if (status === "Delivered" && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Only Admin can confirm delivery"
            });
        }

        // Stock restore on cancellation (only once, only if not already cancelled)
        if (status === "Cancelled" && order.orderStatus !== "Cancelled") {
            const stockUpdates = order.items.map(item => {
                const update = {
                    $inc: {
                        stock: item.quantity,
                        totalSold: -item.quantity
                    }
                };

                // if variant exists, restore variant stock too
                if (item.variantId) {
                    update.$inc["variants.$.stock"] = item.quantity;
                    return {
                        updateOne: {
                            filter: {
                                _id: item.productId,
                                "variants._id": item.variantId
                            },
                            update
                        }
                    };
                }

                return {
                    updateOne: {
                        filter: { _id: item.productId },
                        update
                    }
                };
            });

            await Product.bulkWrite(stockUpdates);
        }

        // Build update payload
        const updatePayload = {
            orderStatus: status,
            $push: { trackingHistory: { status, timestamp: new Date() } }
        };

        if (status === "Delivered") {
            updatePayload.deliveredAt = Date.now();
            updatePayload.paymentStatus = 'Completed';
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            order_id,
            updatePayload,
            { new: true }
        )
            .populate('userId', 'name email')
            .populate('items.productId', 'prodName prodImage');

        // ==========================================
        // NEW TRANSACTION LOGIC START
        // ==========================================
        if (status === "Delivered") {
            try {
                // 1. Har item ke liye vendor earning calculate karein
                // Kyunki ek order mein multiple vendors ho sakte hain
                const vendorEarnings = {};

                updatedOrder.items.forEach(item => {
                    const vId = item.vendorId.toString();
                    const itemTotal = item.price * item.quantity;

                    if (vendorEarnings[vId]) {
                        vendorEarnings[vId].total += itemTotal;
                    } else {
                        vendorEarnings[vId] = { total: itemTotal };
                    }
                });

                // 2. Har vendor ke liye ek Transaction entry create karein
                const transactionPromises = Object.keys(vendorEarnings).map(async (vId) => {
                    const totalAmount = vendorEarnings[vId].total;
                    const fee = Number((totalAmount * 0.10).toFixed(2)); // 10% Platform Fee
                    const netAmount = Number((totalAmount - fee).toFixed(2));

                    // Unique ID Generate karein (Short & Clean)
                    const shortOrderId = order_id.toString().slice(-6).toUpperCase();
                    const shortVendorId = vId.slice(-4).toUpperCase();
                    const customTxnId = `TXN-${shortOrderId}-${shortVendorId}`;

                    return Transaction.create({
                        vendorId: vId,
                        orderId: updatedOrder._id,
                        txnId: customTxnId,
                        orderDisplayId: `#ORD-${shortOrderId}`,
                        totalAmount: totalAmount,
                        platformFee: fee,
                        netEarning: netAmount,
                        paymentMethod: updatedOrder.paymentMethod || 'Online',
                        status: 'Pending' // Admin settle karega manual payment ke baad
                    });
                });

                await Promise.all(transactionPromises);
                console.log("Transactions generated successfully for Order:", order_id);
            } catch (txnError) {
                // Hum order update ko fail nahi karenge, bas error log karenge
                console.error("Transaction Generation Error:", txnError);
                return res.status(500).json({
                    success: false,
                    message: "Error Occur to create transcation"
                });
            }
        }
        // ==========================================
        // NEW TRANSACTION LOGIC END
        // ==========================================

        // Email
        const firstProductName = updatedOrder.items[0]?.productId?.prodName || "Your Order";
        const otherItemsCount = updatedOrder.items.length - 1;
        const orderDisplayTitle = otherItemsCount > 0
            ? `${firstProductName} (and ${otherItemsCount} more items)`
            : firstProductName;

        let statusMessage = "Good news! The status of your purchase has been updated.";
        let statusColor = "#00b894";
        if (status === "Cancelled") {
            statusMessage = "We're sorry to inform you that your order status has been updated.";
            statusColor = "#d63031";
        }

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
                <h2 style="color: #2d3436;">Hi ${updatedOrder.userId.name},</h2>
                <p style="font-size: 16px;">${statusMessage}</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Product:</strong> ${orderDisplayTitle}</p>
                    <p style="margin: 5px 0;"><strong>New Status:</strong> 
                        <span style="color: ${statusColor}; font-weight: bold;">${status}</span>
                    </p>
                    <p style="margin: 5px 0; color: #636e72; font-size: 12px;">Order ID: #${order_id}</p>
                </div>
                ${status === "Cancelled"
                ? `<p>If you didn't request this or have any questions, please contact our support team.</p>`
                : `<p>You can track your order live on our website.</p>`
            }
                <p>Thanks, <br/><strong>EasyShop Team</strong></p>
            </div>
        `;

        sendEmail(updatedOrder.userId.email, `EasyShop: Order ${status}`, emailHtml);

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            data: updatedOrder
        });

    } catch (err) {
        console.error("Update Order Status Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};