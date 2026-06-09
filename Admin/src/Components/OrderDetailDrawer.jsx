
import React from 'react';
import { FiX, FiPackage, FiTruck, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

function OrderDetailDrawer({ order, isOpen, onClose }) {

    const { t } = useTranslation();

    const statusColors = {
        Delivered: 'text-emerald-500',
        Processing: 'text-amber-500',
        Shipped: 'text-blue-500',
        Cancelled: 'text-red-500',
        Pending: 'text-slate-500'
    };

    // helper to get variant image
    const getVariantImage = (item) => {
    const productInfo = item.productInfo || item.productId;
    const color = item.selectedColor;
    const images = productInfo?.attributes?.Color?.images;
    if (color && images?.[color]?.[0]) return images[color][0];
    return productInfo?.prodImage;
};

    if (!isOpen || !order) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">

            <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl animate-slide-in overflow-y-auto">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white truncate">
                            {t('orderDetailDrawer.title')}
                        </h2>
                        <p className="text-[11px] md:text-xs text-slate-400 mt-1 uppercase tracking-widest truncate">
                            {t('orderDetailDrawer.idLabel')} #{order._id}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="shrink-0 p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <FiX size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-8">

                    {/* 1. Items List */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <FiPackage className="text-pink-500 shrink-0" />
                            <h3 className="font-bold text-slate-700 dark:text-slate-200">
                                {t('orderDetailDrawer.sectionItems')}
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {order.items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                                >
                                    {/* Product Image */}
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                                        <img
                                            src={getVariantImage(item) || item.productInfo?.prodImage || item.productId?.prodImage}
                                            alt="product"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Info Container */}
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                                            {item.productInfo?.prodName}
                                        </h4>

                                        {/* Color and Size */}
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {item.selectedColor && (
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/50 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                                    {item.selectedColor}
                                                </span>
                                            )}
                                            {item.selectedSize && (
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-200/50 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                                    {t('orderDetailDrawer.sizeLabel')} {item.selectedSize}
                                                </span>
                                            )}
                                        </div>

                                        {/* Qty & Unit Price */}
                                        <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                                            {item.quantity} x ₹{item.price}
                                        </p>
                                    </div>

                                    {/* Total Price */}
                                    <div className="text-sm font-black text-slate-800 dark:text-white shrink-0 pl-2">
                                        ₹{item.quantity * item.price}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 2. Customer & Shipping */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Shipping Info */}
                        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20">
                            <div className="flex items-center gap-2 mb-2 text-blue-600">
                                <FiMapPin size={14} className="shrink-0" />
                                <span className="text-[11px] font-black uppercase truncate">
                                    {t('orderDetailDrawer.sectionShipping')}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                                {order.userInfo?.name || order.shippingAddress?.name || t('orderDetailDrawer.guest')}
                            </p>

                            <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                                <p className="wrap-break-word">{order.shippingAddress?.address}</p>
                                <p className="wrap-break-word">
                                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                                </p>
                                <p className="mt-1 font-semibold text-slate-600 dark:text-slate-400">
                                    {t('orderDetailDrawer.contactLabel')} {order.shippingAddress?.contact}
                                </p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20">
                            <div className="flex items-center gap-2 mb-2 text-emerald-600">
                                <FiCreditCard size={14} className="shrink-0" />
                                <span className="text-[11px] font-black uppercase truncate">
                                    {t('orderDetailDrawer.sectionPayment')}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                                {order.paymentMethod}
                            </p>

                            <div className="space-y-1 mt-1">
                                <p className={`text-[10px] font-bold ${order.paymentStatus === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    ● {order.paymentStatus} - {t('orderDetailDrawer.paymentSuffix')}
                                </p>
                                <p className={`text-[10px] font-bold ${statusColors[order.orderStatus] || 'text-slate-500'}`}>
                                    ● {order.orderStatus} - {t('orderDetailDrawer.orderSuffix')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 3. Price Breakdown */}
                    <section className="bg-slate-900 dark:bg-slate-800 text-white p-5 md:p-6 rounded-3xl shadow-xl shadow-slate-200 dark:shadow-none">
                        <div className="space-y-3">
                            {/* Subtotal */}
                            <div className="flex justify-between items-center gap-4 text-slate-400 text-sm">
                                <span className="truncate">{t('orderDetailDrawer.subtotal')}</span>
                                <span className="font-semibold text-white whitespace-nowrap">
                                    ₹{order.items.reduce((a, b) => a + (b.price * b.quantity), 0)}
                                </span>
                            </div>

                            {/* Shipping */}
                            <div className="flex justify-between items-center gap-4 text-slate-400 text-sm">
                                <span className="truncate">{t('orderDetailDrawer.shippingFee')}</span>
                                <span className="text-emerald-400 font-semibold whitespace-nowrap">
                                    {t('orderDetailDrawer.shippingFree')}
                                </span>
                            </div>

                            {/* Grand Total */}
                            <div className="pt-4 border-t border-slate-700 flex justify-between items-center gap-4">
                                <span className="font-bold text-sm md:text-base truncate">
                                    {t('orderDetailDrawer.grandTotal')}
                                </span>
                                <span className="text-xl md:text-2xl font-black text-pink-500 whitespace-nowrap">
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