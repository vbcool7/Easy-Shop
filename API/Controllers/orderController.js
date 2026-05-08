
import Order from '../Models/orderModelSchema.js';
import Cart from '../Models/cartModelSchema.js';
import Product from '../Models/productModelSchema.js';
import Transaction from '../Models/transactionModelSchema.js';
import Vendor from '../Models/vendorModelSchema.js';

import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import sendEmail from '../utils/sendEmail.js';

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
            if (item.selectedSize) {
                const sizeStock = product.attributes?.get('Size')?.stock?.[item.selectedSize] ?? 0;
                if (sizeStock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `${product.prodName} in size ${item.selectedSize} out of stock. Only ${sizeStock} remaining.`
                    });
                }
            }

            // Order items array taiyaar karo
            orderItems.push({
                productId: product._id,
                vendorId: product.vendorId,
                quantity: item.quantity,
                price: product.price,
                selectedColor: item.selectedColor || null,
                selectedSize: item.selectedSize || null,
            });

            totalAmount += product.price * item.quantity;
        }

        // 3. Naya Order Create karo
        const newOrder = new Order({
            userId,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod,
            paymentStatus: paymentMethod === "COD" ? "Pending" : "Completed"
        });

        await newOrder.save();

        // 4. Sabse Important: Product ka Stock Update karo (main top)
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: {
                    stock: -item.quantity,
                    totalSold: item.quantity
                }
            });

            // decrease size stock if selectedSize exists
            if (item.selectedSize) {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: {
                        [`attributes.Size.stock.${item.selectedSize}`]: -item.quantity
                    }
                });
            }
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

        if (!product || product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `${product?.prodName || "Product"} out of stock.`
            });
        }

        // check size stock
        if (selectedSize) {
            const sizeStock = product.attributes?.get('Size')?.stock?.[selectedSize] ?? 0;
            if (sizeStock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Size ${selectedSize} out of stock. Only ${sizeStock} remaining.`
                });
            }
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
            }],

            totalAmount: product.price * quantity,
            shippingAddress,
            paymentMethod,
            paymentStatus: paymentMethod === "COD" ? "Pending" : "Completed"
        });

        await newOrder.save();

        // order place decrease quantity
        await Product.findByIdAndUpdate(prod_id, {
            $inc: {
                stock: -quantity,
                totalSold: quantity
            }
        });

        // decrease size stock
        if (selectedSize) {
            await Product.findByIdAndUpdate(prod_id, {
                $inc: {
                    [`attributes.Size.stock.${selectedSize}`]: -quantity
                }
            });
        }

        //  (Optional) Agar ye product cart mein tha, toh wahan se hata do
        await Cart.findOneAndUpdate({ userId }, { $pull: { items: { productId: prod_id } } });

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

        const orders = await Order.find({ userId })
            .populate("items.productId", "prodName prodImage price  quantity")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalOrders: orders.length,
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

// user
export const getSingleOrderDetail = async (req, res) => {
    try {
        const { order_id } = req.params;

        const order = await Order.findById(order_id)
            .populate('items.productId', 'prodImage prodName price quantity')
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
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity } // Stock plus 
            });
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

        console.log("Params received:", req.params);
        // Check karein ki ID valid hai ya nahi
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
        doc.text(`Total Amount: INR ${order.totalAmount}`, 50, 230);

        // 5. Customer Details
        doc.text(`Bill To:`, 300, 200);
        doc.text(order.userId.name, 300, 215);
        doc.text(order.shippingAddress.address, 300, 230);

        doc.moveDown();

        // 6. Table Header
        const tableTop = 300;
        doc.font('Helvetica-Bold');
        doc.text('Item', 50, tableTop);
        doc.text('Qty', 280, tableTop);
        doc.text('Price', 350, tableTop);
        doc.text('Total', 450, tableTop);
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Table Content mein ab 'itemsToPrint' use karein
        // Table Content
        let i = 0;
        itemsToPrint.forEach(item => {
            const y = tableTop + 30 + (i * 25);
            doc.font('Helvetica').text(item.productId.prodName, 50, y);
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

// vendor
export const getVendorOrders = async (req, res) => {
    try {
        const vendorId = req.user.id;

        const orders = await Order.aggregate([
            // 1. Unwind items array taaki har product alag row ban jaye
            { $unwind: "$items" },

            // 2. Sirf wo items dhoondein jo is vendor ke hain
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $match: {
                    "productDetails.vendorId": new mongoose.Types.ObjectId(vendorId)
                }
            },

            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "customerDetails"
                }
            },
            { $unwind: "$customerDetails" },

            // 5. Sirf wahi data select karein jo zaroori hai (Privacy ke liye)
            {
                $project: {
                    _id: 1,
                    orderStatus: 1,
                    createdAt: 1,
                    totalAmount: 1,
                    paymentStatus: 1,
                    paymentMethod: 1,
                    orderStatus: 1,
                    "items.quantity": 1,
                    "items.price": 1,
                    "productDetails.prodName": 1,
                    "productDetails.prodImage": 1,
                    "productDetails.price": 1,
                    "customerDetails.name": 1,
                    "customerDetails.email": 1,
                    "customerDetails.address": 1
                }
            },

            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).json({
            success: true,
            message: "Here is Order list",
            count: orders.length,
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
                select: 'prodName prodImage price catId',
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

        // Security Check: Kya is order mein is vendor ka koi product hai?
        const isOwnOrder = order.items.some(
            item => item.vendorId?.toString() === vendor_id
        );

        if (req.user.role !== 'admin' && !isOwnOrder) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only view your own orders"
            });
        }

        res.status(200).json({
            success: true,
            message: "Here is Specific vendor's order deatil",
            data: order
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
            const stockUpdates = order.items.map(item => ({
                updateOne: {
                    filter: { _id: item.productId },
                    update: {
                        $inc: {
                            stock: item.quantity,
                            totalSold: -item.quantity
                        }
                    }
                }
            }));
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