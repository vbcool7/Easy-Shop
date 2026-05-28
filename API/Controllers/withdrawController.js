
import Withdraw from '../Models/withdrawModelSchema.js';
import Transaction from '../Models/transactionModelSchema.js';
import Vendor from '../Models/vendorModelSchema.js';

import mongoose from 'mongoose';

// withdraw stats
export const getWithdrawStats = async (req, res) => {
    try {
        const vendorId = new mongoose.Types.ObjectId(req.user.id);

        const vendor = await Vendor.findById(vendorId).select('availableBalance');

        // Pending Settlement (Aggregation on Transactions)
        const pendingData = await Transaction.aggregate([
            { $match: { vendorId: vendorId, status: 'Pending' } },
            { $group: { _id: null, totalPending: { $sum: "$netEarning" } } }
        ]);

        // Total Withdrawn (Aggregation on Withdrawals)
        const withdrawnData = await Withdraw.aggregate([
            { $match: { vendorId: vendorId, status: 'Approved' } },
            { $group: { _id: null, totalWithdrawn: { $sum: "$amount" } } }
        ]);

        // Total In-Process (Withdrawals which are still 'Processing')
        const inProcessData = await Withdraw.aggregate([
            { $match: { vendorId: vendorId, status: 'Processing' } },
            { $group: { _id: null, totalInProcess: { $sum: "$amount" } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                availableBalance: vendor?.availableBalance || 0,
                pendingSettlement: pendingData[0]?.totalPending || 0,
                totalWithdrawn: withdrawnData[0]?.totalWithdrawn || 0,
                inProcess: inProcessData[0]?.totalInProcess || 0
            }
        });

    } catch (err) {
        console.log("Error :", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// withdraw list
export const getWithdrawList = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { search = '', page = 1, limit = 10, status = '' } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const query = { vendorId };

        if (search.trim()) {
            query.requestId = new RegExp(search.trim(), 'i');
        }

        if (status.trim()) query.status = status;

        const [withdrawRequests, total] = await Promise.all([
            Withdraw.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            Withdraw.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            count: total,
            totalPages: Math.ceil(total / limitNum),
            data: withdrawRequests
        });

    } catch (err) {
        console.error("Error: ", err);
        return res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// create withdraw request
export const createWithdrawRequest = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { amount, method } = req.body;

        const vendor = await Vendor.findById(vendorId);

        // 1. Check Balance
        if (vendor.availableBalance < amount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient balance!"
            });
        }

        // 2. Generate Unique Request ID
        const requestId = `WDR-${Date.now().toString().slice(-6)}`;

        // 3. Create Withdrawal Record
        const withdrawal = await Withdraw.create({
            vendorId,
            requestId,
            amount,
            method,
            accountDetails: {
                bankName: vendor.bank,
                accountNo: vendor.accNumber,
                ifsc: vendor.ifsc,
            }
        });

        // 4. Deduct Balance from Vendor (Important!)
        vendor.availableBalance -= amount;
        await vendor.save();

        res.status(201).json({
            success: true,
            message: "Withdrawal request submitted successfully",
            data: withdrawal
        });

    } catch (error) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};