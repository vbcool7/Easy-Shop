
import React, { useEffect, useState } from 'react';
import { HiOutlineDownload, HiOutlineSearch, HiOutlineCurrencyRupee, HiOutlineReceiptTax, HiOutlineCreditCard } from 'react-icons/hi';
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { HiOutlineClock } from "react-icons/hi";
import { HiOutlineCash } from "react-icons/hi";

import { useDownloadTransactionInvoice, useVendorTransactionList, useVendorTransactionStats } from '../../hook/useTransactions';
import { getPaginationRange } from '../../utils/getPaginationRange';

const statusMenu = [
    { id: 1, status: "Completed" },
    { id: 2, status: "Cancelled" }
];

function Transactions() {

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: res, isLoading } = useVendorTransactionStats();
    const { data: transactionResponse, isError } = useVendorTransactionList({
        search: debouncedSearch,
        page,
        status,
        paymentMethod
    });

    const transactions = transactionResponse?.data || [];
    const totalPages = transactionResponse?.totalPages || 1;
    const count = transactionResponse?.count || 0;

    const { mutate: downloadInvoice, isPending, variables } = useDownloadTransactionInvoice();

    const summary = res?.summary || { totalRevenue: 0, totalFees: 0, settledAmount: 0, pendingAmount: 0 };

    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null);

    // amt in format
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const cards = [
        {
            label: "Total Revenue",
            value: formatCurrency(summary?.totalRevenue),
            icon: <HiOutlineCurrencyRupee />,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "Platform Fees (10%)",
            value: formatCurrency(summary?.totalFees),
            icon: <HiOutlineReceiptTax />,
            color: "text-pink-600",
            bg: "bg-pink-50"
        },
        {
            label: "Wallet Credited",
            value: formatCurrency(summary?.settledAmount),
            icon: <HiOutlineCreditCard />,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            label: "Pending Payout",
            value: formatCurrency(summary?.pendingAmount),
            icon: <HiOutlineClock />,
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            label: "COD Collected",
            value: formatCurrency(summary?.codCollected),
            icon: <HiOutlineCash />, // Cash icon use karein
            color: "text-orange-600",
            bg: "bg-orange-50"
        },
    ];

    // top filter
    const handlestatus = (status) => {
        setSelectedStatus(status);
        setIsStatusOpen(false);
    };

    if (isLoading) return <p className="p-10 text-center">Loading transactions...</p>;
    if (isError) return <p className="p-10 text-center text-red-500">Error fetching transactions!</p>;

    return (
        <div className="space-y-6">

            {/* top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {cards.map((stat, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow truncate"
                    >
                        {/* Icon - Mobile pe thoda chota kiya hai */}
                        <div className={`w-11 h-11 md:w-12 md:h-12 shrink-0 rounded-xl 
                            ${stat.bg} ${stat.color} flex items-center justify-center text-lg md:text-2xl`}>
                            {stat.icon}
                        </div>

                        <div className="min-w-0"> {/* min-w-0 truncation handle karne ke liye */}
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-tight truncate">
                                {stat.label}
                            </p>
                            <h4 className="text-lg md:text-xl font-black text-slate-700 dark:text-white truncate">
                                {stat.value}
                            </h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Container */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

                {/* Header & Search/Filter */}
                <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-center md:text-start bg-white dark:bg-slate-800/20">

                    <div>
                        <div className='flex gap-2 items-center'>
                            <h2 className="text-md md:text-lg font-bold text-slate-800 dark:text-white shrink-0">
                                Transaction History
                            </h2>
                            <span className="hidden lg:flex bg-pink-100 text-pink-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                Total: {count || 0}
                            </span>
                        </div>
                        <p className="text-[11px] md:text-xs text-slate-500 mt-1">
                            Manage and organize your transactions
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto mt-3 lg:mt-0">

                        {/* Search */}
                        <div className="relative w-full lg:w-80 group">
                            <HiOutlineSearch className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search Txn ID, Order ID..."
                                className="w-full pl-8 md:pl-11 pr-4 py-2 bg-slate-50 border border-pink-50 dark:bg-slate-800 dark:text-white focus:border-pink-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm outline-none transition-all shadow-sm placeholder:text-xs md:placeholder:text-[13px]"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                            className="w-full md:w-auto text-sm px-4 py-2 rounded-xl border border-pink-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                        >
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>

                        {/* Payment Method Filter */}
                        <select
                            value={paymentMethod}
                            onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
                            className="w-full md:w-auto text-sm px-4 py-2 rounded-xl border border-pink-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                        >
                            <option value="">All Methods</option>
                            <option value="COD">COD</option>
                            <option value="Online">Online</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 dark:border-slate-800 text-[11px] uppercase tracking-widest text-slate-400 font-bold">
                                <th className="px-6 py-4">Txn Details</th>
                                <th className="px-6 py-4">Related Order</th>
                                <th className="px-6 py-4">Total Amount</th>
                                <th className="px-6 py-4">Platform Fee (10%)</th>
                                <th className="px-6 py-4">Net Earning</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Invoice</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                                        {search || status || paymentMethod
                                            ? 'No transactions match your search or filter.'
                                            : 'No transactions found.'
                                        }
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((txn) => (
                                    <tr key={txn._id}
                                        className="hover:bg-pink-50/30 dark:hover:bg-slate-800/50 transition-colors group">

                                        {/* Txn ID */}
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                {txn.txnId}
                                            </span>
                                            <p className="text-[10px] text-slate-400">
                                                {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </p>
                                        </td>

                                        {/* Order ID + Payment Method */}
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-pink-500">
                                                {txn.orderDisplayId}
                                            </span>
                                            <p className="text-[10px] text-slate-400 uppercase font-bold">
                                                {txn.paymentMethod}
                                            </p>
                                        </td>

                                        {/* Total Amount */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-400 line-through">
                                                ₹{txn.totalAmount}
                                            </span>
                                        </td>

                                        {/* Platform Fee */}
                                        <td className="px-6 py-4 text-red-400 text-xs font-bold">
                                            - ₹{txn.platformFee}
                                        </td>

                                        {/* Net Earning */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-slate-800 dark:text-white">
                                                ₹{txn.netEarning}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase
                                    ${txn.status === 'Completed'
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    : txn.status === 'Cancelled'
                                                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                                        : 'bg-orange-50 text-orange-600 border border-orange-100'
                                                }`}>
                                                {txn.status}
                                            </span>
                                        </td>

                                        {/* Invoice */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => downloadInvoice(txn._id)}
                                                disabled={isPending && variables === txn._id}
                                                className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-pink-500 shadow-sm border border-transparent hover:border-slate-100 transition-all">
                                                {isPending && variables === txn._id ? (
                                                    <span className="text-[10px] animate-pulse">Downloading...</span>
                                                ) : (
                                                    <HiOutlineDownload size={18} />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 py-4 px-6 border-t border-pink-50 dark:border-slate-800">
                        <button
                            onClick={() => setPage(p => Math.max(p - 1, 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-pink-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Prev
                        </button>

                        {getPaginationRange(page, totalPages).map((num, idx) =>
                            num === '...'
                                ? <span key={`dot-${idx}`} className="px-2 py-1.5 text-xs text-slate-400">...</span>
                                : <button
                                    key={num}
                                    onClick={() => setPage(num)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                            ${page === num
                                            ? 'bg-pink-500 text-white border-pink-500'
                                            : 'border-pink-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {num}
                                </button>
                        )}

                        <button
                            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-pink-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Transactions;