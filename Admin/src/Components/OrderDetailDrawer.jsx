
import React from 'react';
import { FiX, FiPackage, FiTruck, FiMapPin, FiCreditCard } from 'react-icons/fi';

function OrderDetailDrawer({ order, isOpen, onClose }) {

    if (!isOpen || !order) return null;

    const statusColors = {
        Delivered: 'text-emerald-500',
        Processing: 'text-amber-500',
        Shipped: 'text-blue-500',
        Cancelled: 'text-red-500',
        Pending: 'text-slate-500'
    };

    // helper to get variant image
    const getVariantImage = (item) => {
        const color = item.selectedColor;
        const images = item.productInfo?.attributes?.Color?.images;
        if (color && images?.[color]?.[0]) return images[color][0];
        return item.productInfo?.prodImage;
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">

            <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl animate-slide-in overflow-y-auto">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white">
                            Order Details
                        </h2>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">
                            ID: #{order._id}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <FiX size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-8">

                    {/* 1. Items List */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <FiPackage className="text-pink-500" />
                            <h3 className="font-bold text-slate-700 dark:text-slate-200">
                                Order Items
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {order.items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-4 p-3 rounded-xl border border-slate-50 dark:border-slate-800 bg-slate-50/30">

                                    <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                                        <img
                                            src={getVariantImage(item) || item.productInfo?.prodImage}
                                            alt="product"
                                            className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-1">

                                        {/* prod name */}
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 line-clamp-1">
                                            {item.productInfo?.prodName}
                                        </h4>

                                        {/* color and size */}
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {item.selectedColor && (
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                    {item.selectedColor}
                                                </span>
                                            )}

                                            {item.selectedSize && (
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                    Size: {item.selectedSize}
                                                </span>
                                            )}
                                        </div>

                                        {/* qty */}
                                        <p className="text-xs text-slate-400">
                                            Qty: {item.quantity} x  ₹{item.price}
                                        </p>
                                    </div>

                                    {/* price */}
                                    <div className="text-sm font-black text-slate-800 dark:text-white">
                                        ₹{item.quantity * item.price}
                                    </div>

                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 2. Customer & Shipping */}
                    <section className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20">

                            <div className="flex items-center gap-2 mb-2 text-blue-600">
                                <FiMapPin size={14} />
                                <span className="text-[11px] font-black uppercase">
                                    Shipping To
                                </span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {order.userInfo?.name || order.shippingAddress?.name || "Guest"}
                            </p>

                            <div className="text-[11px] text-slate-500 leading-relaxed mt-1">
                                <p>{order.shippingAddress?.address}</p>
                                <p>
                                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                                </p>
                                <p className="mt-1 font-semibold text-slate-600">
                                    Contact: {order.shippingAddress?.contact}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20">
                            <div className="flex items-center gap-2 mb-2 text-emerald-600">
                                <FiCreditCard size={14} />
                                <span className="text-[11px] font-black uppercase">Payment</span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {order.paymentMethod}
                            </p>
                            <p className={`text-[10px] font-bold mt-1 
                                ${order.paymentStatus === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                ● {order.paymentStatus} - payment
                            </p>

                            <p className={`text-[10px] font-bold mt-1 
                                ${statusColors[order.orderStatus] || 'text-slate-500'}`}>
                                ● {order.orderStatus} - order
                            </p>
                        </div>
                    </section>

                    {/* 3. Price Breakdown */}
                    <section className="bg-slate-900 dark:bg-slate-800 text-white p-6 rounded-3xl shadow-xl shadow-slate-200 dark:shadow-none">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-slate-400">
                                <span>Subtotal</span>
                                <span>₹{order.items.reduce((a, b) => a + (b.price * b.quantity), 0)} </span>
                            </div>

                            <div className="flex justify-between text-slate-400">
                                <span>Shipping Fee</span>
                                <span className="text-emerald-400">FREE</span>
                            </div>

                            <div className="pt-4 border-t border-slate-700 flex justify-between items-end">
                                <span className="font-bold">Grand Total</span>
                                <span className="text-2xl font-black text-pink-500">
                                    ₹{order.totalAmount}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailDrawer;