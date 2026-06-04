
import React from 'react';
import { FiX, FiPackage, FiTruck, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { HiOutlineX } from "react-icons/hi";
import { FiClock } from "react-icons/fi";

import { useSingleOrderDetail } from '../../hook/useOrders';

import { useTranslation } from 'react-i18next';

function OrderDetailDrawer({ orderId, isOpen, onClose }) {
    const { t } = useTranslation();
    const { data: order, isLoading, isError } = useSingleOrderDetail(orderId);

    if (!isOpen || !order) return null;

    const statusColors = {
        Pending: "text-slate-600",
        Processing: "text-amber-600",
        Shipped: "text-blue-600",
        Delivered: "text-emerald-600",
        Cancelled: "text-rose-600",
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl animate-slide-in overflow-y-auto"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-white">
                            {t('orderDetailDrawer.heading')}
                        </h2>

                        <div className="flex gap-2 mt-1">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                {t('orderDetailDrawer.idLabel', { id: order._id })}
                            </p>

                            <span className="text-[10px] text-slate-300">|</span>
                            <p className="text-[10px] text-slate-400 font-bold">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full">
                        <HiOutlineX size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-8">

                    {/* 1. Items List */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <FiPackage className="text-pink-500" />
                            <h3 className="font-bold text-slate-700 dark:text-slate-200">
                                {t('orderDetailDrawer.sectionOrderItems')}
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {order?.items?.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-4 p-3 rounded-xl border border-slate-50 dark:border-slate-800 bg-slate-50/30">
                                    <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                                        <img
                                            src={item.variantImage || item.productId?.prodImage}
                                            alt={item.productId?.prodName || "product"}
                                            className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-1">
                                        {/* prod name */}
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 line-clamp-1">
                                            {item.productId?.prodName}
                                        </h4>

                                        {/* color, size */}
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {item.selectedColor && (
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                    {item.selectedColor}
                                                </span>
                                            )}

                                            {item.selectedSize && (
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                    {t('orderDetailDrawer.sizeLabel', { size: item.selectedSize })}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-slate-400 mt-1">
                                            {t('orderDetailDrawer.qtyCalculation', { qty: item.quantity, price: item.price })}
                                        </p>
                                    </div>

                                    <div className="text-sm font-black text-slate-800 dark:text-white">
                                        ₹{item.quantity * item.price}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 2. Customer & Shipping */}
                    <section className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50">
                            <div className="flex items-center gap-2 mb-2 text-blue-600">
                                <FiMapPin size={14} />
                                <span className="text-[11px] font-black uppercase">{t('orderDetailDrawer.badgeShippingTo')}</span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{order.userId?.name}</p>
                            <div className="text-[11px] text-slate-500 leading-relaxed mt-1">
                                <p className="line-clamp-2">{order.shippingAddress?.address}</p>
                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.pincode}</p>
                                <a href={`tel:${order.shippingAddress?.contact}`} className="mt-1 inline-block font-bold text-blue-600 hover:underline">
                                    📞 {order.shippingAddress?.contact}
                                </a>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20">
                            <div className="flex items-center gap-2 mb-2 text-emerald-600">
                                <FiCreditCard size={14} />
                                <span className="text-[11px] font-black uppercase">{t('orderDetailDrawer.badgePayment')}</span>
                            </div>

                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {order.paymentMethod === 'COD' && t('orderDetailDrawer.methodCOD')}
                                {order.paymentMethod === 'Online' && t('orderDetailDrawer.methodOnline')}
                                {!['COD', 'Online'].includes(order.paymentMethod) && order.paymentMethod}
                            </p>

                            <p className={`text-[10px] font-bold mt-1
                                ${order.paymentStatus === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                ● {order.paymentStatus === 'Completed' && t('orderDetailDrawer.payStatusCompleted')}
                                {order.paymentStatus === 'Pending' && t('orderDetailDrawer.payStatusPending')}
                                {order.paymentStatus === 'Failed' && t('orderDetailDrawer.payStatusFailed')}
                                {!['Completed', 'Pending', 'Failed'].includes(order.paymentStatus) && order.paymentStatus} - {t('orderDetailDrawer.suffixPayment')}
                            </p>

                            <p className={`text-[10px] font-bold mt-1
                                ${statusColors[order.orderStatus] || 'text-slate-500'}`}>
                                ● {order.orderStatus === 'Pending' && t('orderDetailDrawer.orderStatusPending')}
                                {order.orderStatus === 'Processing' && t('orderDetailDrawer.orderStatusProcessing')}
                                {order.orderStatus === 'Shipped' && t('orderDetailDrawer.orderStatusShipped')}
                                {order.orderStatus === 'Delivered' && t('orderDetailDrawer.orderStatusDelivered')}
                                {order.orderStatus === 'Cancelled' && t('orderDetailDrawer.orderStatusCancelled')}
                                {!['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus) && order.orderStatus} - {t('orderDetailDrawer.suffixOrder')}
                            </p>
                        </div>
                    </section>

                    {/* 3. Tracking Timeline */}
                    {order.trackingHistory && (
                        <section>
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                                <FiClock className="text-blue-500" /> {t('orderDetailDrawer.sectionOrderTimeline')}
                            </h3>
                            <div className="space-y-4 ml-2 border-l-2 border-slate-100 dark:border-slate-800 pl-4">
                                {order.trackingHistory.map((track, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-5.25 top-1 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"></div>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {track.status === 'Pending' && t('orderDetailDrawer.orderStatusPending')}
                                            {track.status === 'Processing' && t('orderDetailDrawer.orderStatusProcessing')}
                                            {track.status === 'Shipped' && t('orderDetailDrawer.orderStatusShipped')}
                                            {track.status === 'Delivered' && t('orderDetailDrawer.orderStatusDelivered')}
                                            {track.status === 'Cancelled' && t('orderDetailDrawer.orderStatusCancelled')}
                                            {!['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(track.status) && track.status}
                                        </p>
                                        <p className="text-[10px] text-slate-400">{new Date(track.timestamp).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 3. Price Breakdown */}
                    <section className="bg-slate-900 dark:bg-slate-800 text-white p-6 rounded-3xl shadow-xl shadow-slate-200 dark:shadow-none">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-slate-400">
                                <span>{t('orderDetailDrawer.priceSubtotal')}</span>
                                <span>₹{order.items.reduce((a, b) => a + (b.price * b.quantity), 0)} </span>
                            </div>

                            <div className="flex justify-between text-slate-400">
                                <span>{t('orderDetailDrawer.priceShippingFee')}</span>
                                <span className="text-emerald-400">{t('orderDetailDrawer.priceShippingFree')}</span>
                            </div>

                            <div className="pt-4 border-t border-slate-700 flex justify-between items-end">
                                <span className="font-bold">{t('orderDetailDrawer.priceGrandTotal')}</span>
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
}

export default OrderDetailDrawer;