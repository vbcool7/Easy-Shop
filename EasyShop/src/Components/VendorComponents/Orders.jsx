
import React, { useState } from 'react';
import { HiOutlineClock } from "react-icons/hi";
import { HiOutlineRefresh } from "react-icons/hi";
import { HiOutlineTruck } from "react-icons/hi";
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { HiOutlineXCircle } from "react-icons/hi";
import { HiOutlineEye } from "react-icons/hi";
import { HiOutlineDownload } from "react-icons/hi";
import { HiOutlineSearch } from "react-icons/hi";

import { useOrderInvoiceDownload, useOrderStats, useUpdateOrderStatus, useVendorOrders } from '../../hook/useOrders';
import OrderDetailDrawer from './OrderDetailDrawer';

function Orders() {

    const { data: getStats } = useOrderStats();
    const { data: orders, isLoading, isError, error } = useVendorOrders();
    const { mutate: updateOrderStatus, isPending: isUpdating } = useUpdateOrderStatus();
    const { mutate: downloadInvoice, isPending, variables } = useOrderInvoiceDownload();

    const [selectedOrderId, setIsSelectedOrderId] = useState(null);

    const orderStatusStyles = {
        Processing: "bg-amber-50 text-amber-600 border-amber-100",
        Shipped: "bg-blue-50 text-blue-600 border-blue-100",
        Cancelled: "bg-rose-50 text-rose-600 border-rose-100",
    };

    const paymentStatusStyles = {
        Pending: {
            label: "Pending",
            container: "bg-amber-50 text-amber-600 border-amber-100",
            dot: "bg-amber-500"
        },
        Completed: {
            label: "Completed",
            container: "bg-emerald-50 text-emerald-600 border-emerald-100",
            dot: "bg-emerald-500"
        },
        Failed: {
            label: "Failed",
            container: "bg-rose-50 text-rose-600 border-rose-100",
            dot: "bg-rose-500"
        },
        Refunded: {
            label: "Refunded",
            container: "bg-indigo-50 text-indigo-600 border-indigo-100",
            dot: "bg-indigo-500"
        }
    };

    const paymentMethodStyles = {
        COD: {
            label: "Cash on Delivery",
            short: "COD",
            text: "text-amber-700",
            bg: "bg-amber-50",
            border: "border-amber-200"
        },
        Online: {
            label: "Online Payment",
            short: "Online",
            text: "text-blue-700",
            bg: "bg-blue-50",
            border: "border-blue-200"
        }
    };

    const stats = [
        {
            label: "Pending",
            count: getStats?.Pending || 0,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
            borderColor: "border-yellow-400",
            icon: <HiOutlineClock />
        },
        {
            label: "Processing",
            count: getStats?.Processing || 0,
            color: "text-blue-600",
            bg: "bg-blue-50",
            borderColor: "border-blue-400",
            icon: <HiOutlineRefresh />
        },
        {
            label: "Shipped",
            count: getStats?.Shipped || 0,
            color: "text-purple-600",
            bg: "bg-purple-50",
            borderColor: "border-purple-400",
            icon: <HiOutlineTruck />
        },
        {
            label: "Delivered",
            count: getStats?.Delivered || 0,
            color: "text-green-600",
            bg: "bg-green-50",
            borderColor: "border-green-400",
            icon: <HiOutlineBadgeCheck />
        },
        {
            label: "Cancelled",
            count: getStats?.Cancelled || 0,
            color: "text-red-600",
            bg: "bg-red-50",
            borderColor: "border-red-400",
            icon: <HiOutlineXCircle />
        },
    ];

    // update status
    const handleOrderStatusChange = (orderId, newStatus) => {
        updateOrderStatus({ order_id: orderId, status: newStatus });
    };

    if (isLoading) return <p className="p-10 text-center animate-pulse">Fetching orders...</p>;
    if (isError) return <p className="p-10 text-center text-red-500">Error loading orders.</p>;

    return (
        <div>
            {/* Heading Section */}
            <div className="md:bg-white/80 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-center md:text-start gap-4 mb-3 md:mb-8">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
                        Live Orders Hub
                    </h1>

                    <p className="text-[11px] md:text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center md:justify-start gap-1 md:gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        <span className="opacity-30">|</span>
                        Real-time updates
                    </p>
                </div>
            </div>

            {/* Order Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10 md:my-15">
                {stats.map((item, index) => (
                    <div
                        key={index}
                        className={`flex justify-between items-start bg-white dark:bg-slate-900 p-5 lg:py-5 lg:px-3 xl:p-5 rounded-xl  dark:border-slate-800 border-l-4 border-b-2 
                            ${item.borderColor || 'border-pink-400'} 
                            shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group`}
                    >
                        <div className="flex flex-col gap-1">
                            <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                {item.label}
                            </p>

                            <h3 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">
                                {item.count}
                            </h3>
                        </div>

                        <div className={`w-10 h-10 flex items-center justify-center rounded-2xl ${item.bg} ${item.color} text-xl shadow-inner`}>
                            {item.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

                {/* Header and Search */}
                <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-800/20">

                    <h3 className="text-[11px] md:text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider pb-4 md:pb-0">
                        Recent Orders
                    </h3>

                    {/* Search Bar (Left Side) */}
                    <div className="relative w-full md:w-80 group">
                        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search product, SKU..."
                            className="w-full pl-11 pr-4 py-2 md:py-2.5 bg-slate-50 border border-pink-50 dark:bg-slate-800 focus:border-pink-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm outline-none transition-all shadow-sm placeholder:text-xs md:placeholder:text-[13px]"
                        />
                    </div>
                </div>

                {orders && orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Quantity</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Payment Method</th>
                                    <th className="px-6 py-4">Payment Status</th>
                                    <th className="px-6 py-4">Order Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {orders.map((order, index) => {
                                    return (
                                        <tr
                                            key={index}
                                            className="hover:bg-pink-50/30 dark:hover:bg-slate-800/50 transition-colors group">

                                            {/* 1. Order ID & Date */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                    #{order._id.slice(-6).toUpperCase()}
                                                </span>

                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                        day: '2-digit', month: 'short', year: 'numeric'
                                                    })}
                                                </p>
                                            </td>

                                            {/* 2. Customer */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium truncate max-w-25">
                                                        {order.customerDetails?.name}
                                                    </span>

                                                    <span className="text-[10px] text-slate-400 leading-none">
                                                        {order.customerDetails?.email}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* 3. Product Thumbnail & Name */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">

                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                                        <img
                                                            src={order.variantImage || order.productDetails?.prodImage}
                                                            alt={order.productDetails?.prodName}
                                                            className="w-full h-full object-cover" />
                                                    </div>

                                                    {/* prod info color, size */}
                                                    <div className="max-w-35">
                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                                                            {order.productDetails?.prodName}
                                                        </p>

                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {order.items?.selectedColor && (
                                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                                    {order.items.selectedColor}
                                                                </span>
                                                            )}

                                                            {order.items?.selectedSize && (
                                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                                    Size: {order.items.selectedSize}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                </div>
                                            </td>

                                            {/* 4. Quantity */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                    {order.items?.quantity || 0}
                                                </span>
                                            </td>

                                            {/* 5. Total Amount */}
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-slate-800 dark:text-white">
                                                    ₹{((order.items?.price || 0) * (order.items?.quantity || 0)).toLocaleString()}
                                                </span>
                                            </td>

                                            {/* Payment method */}
                                            <td className="px-6 py-4">
                                                {(() => {
                                                    const style = paymentMethodStyles[order.paymentMethod] || paymentMethodStyles.COD;

                                                    return (
                                                        <span className={`text-[10px] font-bold flex items-center gap-1.5 px-2 py-1 rounded-md 
                                                        ${style.bg} ${style.text} ${style.border}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full 
                                                    ${style.text.replace('text')}`}>
                                                            </span>
                                                            {style.short}
                                                        </span>
                                                    );
                                                })()}
                                            </td>

                                            {/* Payment Status */}
                                            <td className="px-6 py-4">
                                                {(() => {
                                                    const pStyle = paymentStatusStyles[order.paymentStatus] || paymentStatusStyles.Pending;
                                                    return (
                                                        <span className={`text-[10px] font-bold flex items-center gap-1.5 px-4 py-1 ${pStyle.container}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dot}`}></span>
                                                            {pStyle.label}
                                                        </span>
                                                    );
                                                })()}
                                            </td>

                                            {/* Order Status */}
                                            <td className="px-6 py-4 text-center">
                                                {/* Condition: Agar status vendor ke control ke bahar hai (e.g., Pending or Delivered) */}
                                                {!["Processing", "Shipped", "Cancelled"].includes(order.orderStatus) ? (
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border 
                                                    ${orderStatusStyles[order.orderStatus] || "bg-gray-50 text-gray-600 border-gray-100"}`}>
                                                        {order.orderStatus}
                                                    </span>
                                                ) : (
                                                    <select
                                                        disabled={isLoading}
                                                        value={order.orderStatus}
                                                        onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                                                        className={`px-3 py-1 rounded-full text-[10px] font-bold border outline-none cursor-pointer transition-all ${orderStatusStyles[order.orderStatus]}`}
                                                    >
                                                        <option value="Processing">Processing</option>
                                                        <option value="Shipped">Shipped</option>
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                )}
                                            </td>

                                            {/* 9. Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setIsSelectedOrderId(order._id)}
                                                        className="p-1.5 bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-pink-500 shadow-sm border border-transparent hover:border-slate-100 transition-all">
                                                        <HiOutlineEye size={18} />
                                                    </button>

                                                    <button
                                                        onClick={() => downloadInvoice(order._id)}
                                                        disabled={isPending && variables === order._id}
                                                        className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-500 shadow-sm border border-transparent hover:border-slate-100 transition-all disabled:opacity-50"
                                                    >
                                                        {isPending && variables === order._id ? (
                                                            <span className="text-[10px] animate-pulse">Downloading...</span>
                                                        ) : (
                                                            <HiOutlineDownload size={18} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-slate-400">No orders found yet.</p>
                    </div>
                )}
            </div>

            {/* detail model */}
            <OrderDetailDrawer
                orderId={selectedOrderId}
                isOpen={!!selectedOrderId}
                onClose={() => setIsSelectedOrderId(null)}
            />
        </div>
    )
}

export default Orders;