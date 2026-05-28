
import Transaction from '../Models/transactionModelSchema.js';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';

// transaction stats
export const getTransactionsStats = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const vId = new mongoose.Types.ObjectId(vendorId);

        // Saari transactions list (Pagination lagana future mein achha rahega)
        const transactions = await Transaction.find({ vendorId: vId })
            .sort({ createdAt: -1 })
            .limit(10); // Abhi ke liye top 10

        const stats = await Transaction.aggregate([
            { $match: { vendorId: vId } },
            {
                $group: {
                    _id: null,

                    // 1. Only count non-cancelled transactions for Revenue
                    totalRevenue: {
                        $sum: { $cond: [{ $ne: ["$status", "Cancelled"] }, "$totalAmount", 0] }
                    },

                    // 2. Total Commission (Jo Admin ne liya)
                    totalFees: {
                        $sum: { $cond: [{ $ne: ["$status", "Cancelled"] }, "$platformFee", 0] }
                    },

                    // 3. Settled Amount (Jo paisa vendor ko mil chuka hai): COD + Completed Online Payouts
                    settledAmount: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $eq: ["$paymentMethod", "COD"] },
                                        { $eq: ["$status", "Completed"] }
                                    ]
                                },
                                "$netEarning", 0
                            ]
                        }
                    },

                    // 4. Pending Amount (Jo paisa abhi Admin se lena baaki hai - Online Orders)
                    pendingAmount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$status", "Pending"] }, { $eq: ["$paymentMethod", "Online"] }] },
                                "$netEarning",
                                0
                            ]
                        }
                    },

                    // 5. COD Received (Jo cash vendor ke paas customer se aa gaya)
                    codCollected: {
                        $sum: {
                            $cond: [{ $eq: ["$paymentMethod", "COD"] }, "$totalAmount", 0]
                        }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: "Here is vendor's transaction stats",
            data: transactions,
            summary: stats[0] || {
                totalRevenue: 0,
                totalFees: 0,
                settledAmount: 0,
                pendingAmount: 0,
                codCollected: 0
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// transaction list
// export const transactionList = async (req, res) => {
//     try {
//         const vendorId = req.user.id;

//         const transactions = await Transaction.find({ vendorId })
//             .sort({ createdAt: -1 });

//         res.status(200).json({
//             success: true,
//             message: "Here is transaction list of vendor",
//             results: transactions.length,
//             data: transactions
//         });

//     } catch (err) {
//         console.log("Error :", err);
//         res.status(500).json({
//             success: false,
//             message: "Server Error Occur"
//         });
//     }
// };

export const transactionList = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { search = '', page = 1, limit = 10, status = '', paymentMethod = '' } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const query = { vendorId };

        if (search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { txnId: regex },
                { orderDisplayId: regex }
            ];
        }

        if (status.trim()) query.status = status;
        if (paymentMethod.trim()) query.paymentMethod = paymentMethod;

        const [transactions, total] = await Promise.all([
            Transaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
            Transaction.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            count: total,
            totalPages: Math.ceil(total / limitNum),
            data: transactions
        });

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};

// trans invoice download
export const downloadTransactionInvoice = async (req, res) => {
    try {
        const { transaction_id } = req.params;
        const txn = await Transaction.findById(transaction_id);

        if (!txn)
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });

        const doc = new PDFDocument({ margin: 50 });

        // HTTP Headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${txn.txnId}.pdf`);

        doc.pipe(res);

        // 1. Header with Brand Color
        doc.fillColor('#be185d').fontSize(22).text('EASYSHOP', { align: 'center', charSpacing: 1 });
        doc.fontSize(10).fillColor('#64748b').text('SELLER PAYOUT ADVICE', { align: 'center' });
        doc.moveDown(2);

        // 2. Transaction Info Section (Left & Right alignment)
        doc.fillColor('#1e293b').fontSize(10);
        doc.font('Helvetica-Bold').text(`Invoice Date: `, 50, 130, { continued: true }).font('Helvetica').text(new Date().toLocaleDateString('en-IN'));
        doc.font('Helvetica-Bold').text(`Transaction ID: `, 50, 145, { continued: true }).font('Helvetica').text(txn.txnId);
        doc.font('Helvetica-Bold').text(`Order ID: `, 50, 160, { continued: true }).font('Helvetica').text(txn.orderDisplayId);

        // 3. Table Header
        doc.moveDown(3);
        doc.rect(50, doc.y, 500, 20).fill('#f8fafc'); // Table Header Background
        doc.fillColor('#475569').font('Helvetica-Bold').text('Description', 60, doc.y + 5);
        doc.text('Amount (INR)', 450, doc.y, { align: 'right' });
        doc.moveDown(1.5);

        // 4. Line Items
        const drawRow = (label, value, isBold = false) => {
            doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica').fillColor('#1e293b').text(label, 60, doc.y);
            doc.text(`${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 450, doc.y, { align: 'right' });
            doc.moveDown(1);
        };

        drawRow('Gross Revenue', txn.totalAmount);
        drawRow('Platform Fee (10%)', `-${txn.platformFee}`);

        // 5. Final Calculation (Highlighted)
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#e2e8f0');
        doc.moveDown(1);

        // Y-coordinate ko save kar lijiye taaki background aur text ek hi level par rahein
        const barY = doc.y;
        const barHeight = 35;

        // Pink Background
        doc.rect(50, barY, 500, barHeight).fill('#be185d');

        // Text Alignment (Vertical centering ke liye barY + 12 use kiya hai)
        doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold');

        // "Net Payout" Label
        doc.text('Net Payout', 60, barY + 12);

        // "Amount" Value (Usi Y-level par right side mein)
        doc.text(
            `INR ${Number(txn.netEarning).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            50,
            barY + 12,
            { width: 450, align: 'right' }
        );

        // Agle element ke liye cursor ko bar ke niche move kar dein
        doc.y = barY + barHeight + 10;

        // 6. Footer
        doc.moveDown(5);
        // doc.fillColor('#94a3b8').fontSize(8).text('This is a computer-generated document and does not require a physical signature.', { align: 'center' });

        doc.end();

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({
            success: false,
            message: "Server Error Occur"
        });
    }
};