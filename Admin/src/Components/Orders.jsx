
import React from 'react';
import { useState } from 'react';
import OrderDetailDrawer from './OrderDetailDrawer';

import { useOrderList, useUpdateOrderStatus } from '../hooks/useOrders';

function Orders() {

    const { data: orderList, isLoading, isError } = useOrderList();
    const { mutate: updateOrderStatus, isPending: isUpdating } = useUpdateOrderStatus();

    const [selectedOrder, setIsSelectedOrder] = useState(null);

    const orderStatusStyles = {
        Delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
        Processing: "bg-amber-50 text-amber-600 border-amber-100",
        Shipped: "bg-blue-50 text-blue-600 border-blue-100",
        Cancelled: "bg-rose-50 text-rose-600 border-rose-100",
        Pending: "bg-slate-100 text-slate-600 border-slate-200",
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
        },
        Online: {
            label: "Online Payment",
            short: "Online",
            text: "text-blue-700",
        }
    };

    const handleOrderStatusChange = (orderId, newStatus) => {
        updateOrderStatus({ order_id: orderId, status: newStatus });
    };

    if (isLoading) return <p className="p-10 text-center animate-pulse">Fetching orders...</p>;
    if (isError) return <p className="p-10 text-center text-red-500">Error loading orders.</p>;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

            {/* heading */}
            <div className="p-4 md:p-6 border-b border-pink-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                <div>
                    <h2 className="text-md md:text-lg font-bold text-slate-800 dark:text-white shrink-0">
                        Recent Orders
                    </h2>

                    <p className="text-[11px] md:text-xs text-slate-500 mt-1">
                        Manage and organize your products
                    </p>
                </div>

                {/* Search */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="w-full sm:w-64 text-sm px-2 md:px-4 py-2 md:py-2.5 rounded-xl border border-pink-50 bg-slate-50 dark:bg-slate-800 focus:outline-pink-400 focus:bg-white transition-all shadow-sm placeholder:text-xs md:placeholder:text-[13px]"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                        <tr className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Order Qty</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Payment Method</th>
                            <th className="px-6 py-4">Payment Status</th>
                            <th className="px-6 py-4 text-center">Order Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {orderList?.map((order) => (
                            <tr
                                key={order._id}
                                className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors group">

                                {/* Order ID */}
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

                                {/* Product Thumbnail & Name */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                            <img
                                                src={order.items[0]?.variantImage || order.items[0]?.productId?.prodImage}
                                                alt={order.items[0]?.productId?.prodName}
                                                className="w-full h-full object-cover" />
                                        </div>

                                        {/* prod detail */}
                                        <div className="max-w-35">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                                                {order.items[0]?.productId?.prodName}
                                            </p>

                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {order.items[0]?.selectedColor && (
                                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        {order.items[0].selectedColor}
                                                    </span>
                                                )}

                                                {order.items[0]?.selectedSize && (
                                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        Size: {order.items[0].selectedSize}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">
                                                {order.items[0]?.productId?.catId?.catName || '---'}
                                            </p>
                                        </div>

                                    </div>
                                </td>
                                 
                                {/* order qty */}
                                <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {order.items?.reduce((total, item) => total + Number(item.quantity || 0), 0) || 0} items
                                </td>

                                {/* Customer Info */}
                                <td className="px-6 py-4">
                                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                        {order.userId?.name || "Guest"}
                                    </div>
                                </td>

                                {/* Amount */}
                                <td className="px-6 py-4 text-sm font-black text-slate-800 dark:text-white">
                                    ₹{order.totalAmount?.toLocaleString()}
                                </td>

                                {/* Payment method */}
                                <td className="px-6 py-4">
                                    {/* Hum check kar rahe hain ki method valid hai ya nahi, default COD rakha hai */}
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
                                    <span className={`text-[10px] font-bold flex items-center gap-1.5 px-4 py-1 ${paymentStatusStyles[order.paymentStatus].container}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${paymentStatusStyles[order.paymentStatus].dot}`}></span>
                                        {paymentStatusStyles[order.paymentStatus].label}
                                    </span>
                                </td>

                                {/* Order Status */}
                                <td className="px-6 py-4 text-center">
                                    <select
                                        disabled={isLoading}
                                        value={order.orderStatus}
                                        onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold border outline-none cursor-pointer transition-all 
                                            ${orderStatusStyles[order.orderStatus]}`
                                        }
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setIsSelectedOrder(order)}
                                        className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-pink-50 hover:text-pink-600 transition-all active:scale-95 cursor-pointer">
                                        <span className="text-xs font-bold">Details</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* detail model */}
            <OrderDetailDrawer
                order={selectedOrder}
                isOpen={!!selectedOrder}
                onClose={() => setIsSelectedOrder(null)}
            />
        </div>
    );
};

export default Orders;