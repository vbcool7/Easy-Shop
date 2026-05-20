
import React, { useState } from 'react';
import { HiOutlineExternalLink } from "react-icons/hi";

import { useUpdateOrderStatus, useVendorOrders } from '../../hook/useOrders';
import OrderDetailDrawer from './OrderDetailDrawer';

function RecentOrderTable({ setCurrentPage }) {

    const { data: orders, isLoading, isError, error } = useVendorOrders();
    const { mutate: updateOrderStatus, isPending: isUpdating } = useUpdateOrderStatus();

    const [selectedOrderId, setIsSelectedOrderId] = useState(null);

    const orderStatusStyles = {
        Processing: "bg-amber-50 text-amber-600 border-amber-100",
        Shipped: "bg-blue-50 text-blue-600 border-blue-100",
        Cancelled: "bg-rose-50 text-rose-600 border-rose-100",
    };

    // update status
    const handleOrderStatusChange = (orderId, newStatus) => {
        updateOrderStatus({ order_id: orderId, status: newStatus });
    };

    if (isLoading) return <p className="p-10 text-center animate-pulse">Fetching orders...</p>;
    if (isError) return <p className="p-10 text-center text-red-500">Error loading orders.</p>;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-pink-50 dark:border-slate-800 shadow-sm overflow-hidden">

            {/* heading */}
            <div className="p-6 border-b border-pink-50 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-sm md:text-lg font-bold text-slate-800 dark:text-white">
                    Recent Orders
                </h2>
                <button
                    onClick={() => setCurrentPage("Orders")}
                    className="text-xs md:text-sm font-semibold text-pink-500 hover:text-pink-600 transition-colors cursor-pointer">
                    View All Orders
                </button>
            </div>

            {/* table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4">Action</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-pink-50 dark:divide-slate-800">
                        {orders.slice(0, 5).map((order, index) => (
                            <tr
                                key={index}
                                className="hover:bg-pink-50/30 dark:hover:bg-slate-800/30 transition-colors group">

                                {/* order id */}
                                <td className="px-6 py-4 text-sm font-bold text-pink-600">
                                    #{order._id.slice(-6).toUpperCase()}

                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: '2-digit', month: 'short', year: 'numeric'
                                        })}
                                    </p>
                                </td>

                                {/* customer detail */}
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

                                {/* product */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                            <img
                                                src={order.variantImage || order.productDetails?.prodImage}
                                                alt={order.productDetails?.prodName}
                                                className="w-full h-full object-cover" />
                                        </div>

                                        <div className="max-w-35">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                                                {order.productDetails?.prodName}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* amount */}
                                <td className="px-6 py-4">
                                    <span className="text-sm font-black text-slate-800 dark:text-white">
                                        ₹{order.productDetails?.price}
                                    </span>
                                </td>

                                {/* status */}
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

                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => setIsSelectedOrderId(order._id)}
                                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-pink-500 group-hover:text-white transition-all">
                                        <HiOutlineExternalLink className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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

export default RecentOrderTable;