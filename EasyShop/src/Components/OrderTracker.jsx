
import React, { useState } from 'react';
import { FaRegFileAlt } from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md";
import { RiQuestionLine } from "react-icons/ri";
import { useNavigate, useParams } from 'react-router-dom';
import EasyShopLoader from '../Components/EasyShopLoader';
import OrderProgressBar from './OrderProgressBar';
import { useOrderDetail, useOrderInvoiceDownload } from '../hook/useOrders';

function OrderTracker() {

    const { orderId } = useParams();
    const navigate = useNavigate();

    const { data: orderDetail, isLoading, isError } = useOrderDetail(orderId);
    const { mutate: downloadInvoice, isPending: isDownloading } = useOrderInvoiceDownload();

    const statusStyles = {
        Delivered: 'text-green-600',
        Pending: 'text-amber-600',
        Cancelled: 'text-red-600',
        Processing: 'text-blue-600',
        Shipped: 'text-purple-600',
    };

    if (isLoading) return <EasyShopLoader />
    if (isError) return <div className="py-20 text-center text-red-400">Failed to load order detail</div>;

    return (
        <div className="min-h-[70vh] bg-white py-8 md:py-16 px-4 lg:px-6">
            <div className="max-w-6xl mx-auto">

                {/* heading */}
                <div className="flex flex-col items-center pt-2 pb-2">
                    <h1 className='text-2xl md:text-3xl text-pink-500 font-bold tracking-tight'>
                        Order Tracking
                    </h1>
                    <div className="h-1 w-15 md:w-20 bg-pink-500 rounded-full mt-2 opacity-30"></div>
                </div>

                {/* top-section - id */}
                <div className="my-8 p-3 md:p-4 bg-gray-50/50 rounded-2xl border border-gray-100 grid grid-cols-2 md:flex md:justify-between items-center gap-4">
                    <div className="border-r border-gray-200 md:border-none pr-2 md:pr-0">
                        <p className="text-[10px] md:text-xs text-gray-400 uppercase font-black tracking-wider">
                            Order ID
                        </p>
                        <p className="text-[11px] md:text-sm font-mono font-bold text-gray-800 truncate">
                            #{orderDetail?._id?.slice(-6).toUpperCase()}
                        </p>
                    </div>

                    <div className="pl-2 md:pl-0 md:text-right">
                        <p className="text-[10px] md:text-xs text-gray-400 uppercase font-black tracking-wider">
                            Estimated Delivery
                        </p>
                        <p className="text-[11px] md:text-sm font-bold text-pink-500">
                            {new Date(orderDetail?.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'long', year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                {/* progress bar */}
                <OrderProgressBar orderStatus={orderDetail?.orderStatus} />

                {/* Parent section */}
                <div className="mt-10 p-4 md:p-8 border rounded-3xl border-gray-100 shadow-sm flex flex-col lg:flex-row gap-8 md:gap-10 bg-white">

                    {/* Left Side: Product Details */}
                    <div className='w-full lg:w-1/2'>
                        <div className="pb-3 border-b border-gray-100 mb-6">
                            <h2 className='text-xl md:text-2xl text-pink-500 font-bold flex items-center gap-2'>
                                <span className="w-2 h-8 bg-pink-500 rounded-full"></span>
                                Product Items
                            </h2>
                        </div>

                        {orderDetail?.items?.map((item, index) => (
                            <div
                                key={index}
                                className="group p-3 md:p-4 rounded-2xl border border-transparent hover:border-pink-50 hover:bg-pink-50/30 transition-all duration-300 flex flex-row justify-between items-center gap-2">
                                <div className="flex gap-3 md:gap-4 items-center">
                                    <div className="relative shrink-0 overflow-hidden rounded-xl border border-gray-100">
                                        <img
                                            src={
                                                item.productId?.attributes?.Color?.images?.[item.selectedColor]?.[0]
                                                || item.productId?.prodImage
                                            }
                                            className='w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 object-cover group-hover:scale-105 transition-transform duration-500'
                                        />
                                    </div>

                                    <div className="flex flex-col justify-center">
                                        <h3 className="text-gray-800 font-bold text-sm md:text-md leading-tight uppercase tracking-tight w-34 sm:max-w-none">
                                            {item.productId?.prodName}
                                        </h3>

                                        <p className="text-[10px] md:text-sm text-pink-500 font-bold mt-1 bg-pink-50 w-fit px-2 py-0.5 rounded-md">
                                            Qty: {item.quantity}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right shrink-0">
                                    <p className="text-md md:text-xl font-black text-gray-800 tracking-tighter">
                                        ₹{item.price}
                                    </p>
                                    <p className="hidden sm:block text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                                        Price per unit
                                    </p>
                                </div>
                            </div>
                        ))}

                    </div>

                    {/* Right Side: Delivery & Billing */}
                    <div className="w-full lg:w-1/2 space-y-8">

                        {/* Delivery Info Section */}
                        <div className="bg-white">
                            <div className="pb-3 border-b border-gray-100 mb-5">
                                <h2 className='text-lg md:text-xl font-bold text-gray-800 uppercase tracking-tight'>
                                    Delivery Information
                                </h2>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-2 gap-y-6 gap-x-2">
                                <div className="space-y-1">
                                    <p className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        Customer
                                    </p>
                                    <p className="text-gray-700 font-semibold text-sm md:text-base truncate">
                                        {orderDetail?.shippingAddress?.name}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        Payment
                                    </p>
                                    <p className="text-gray-700 font-semibold text-sm md:text-base flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        {orderDetail?.paymentMethod}
                                    </p>
                                </div>

                                <div className="col-span-2 space-y-1 pt-2 border-t border-gray-50">
                                    <p className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider">Address</p>
                                    <p className="text-gray-600 text-[12px] md:text-sm leading-relaxed">
                                        {orderDetail?.shippingAddress?.address},
                                        {orderDetail?.shippingAddress?.city},{' '} <br />
                                        {orderDetail?.shippingAddress?.state} -{' '}
                                        {orderDetail?.shippingAddress?.pincode}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        Contact
                                    </p>
                                    <p className="text-gray-700 font-semibold text-sm">
                                        {orderDetail?.shippingAddress?.contact}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                        Status
                                    </p>
                                    <span className={`py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                                        ${statusStyles[orderDetail?.orderStatus] || 'bg-slate-100 text-slate-500'}`}>
                                        {orderDetail?.orderStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Billing Details Card */}
                        <div className="bg-gray-50/80 p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-100/30 rounded-full -mr-12 -mt-12 blur-2xl"></div>

                            <h2 className='text-md md:text-lg font-bold text-gray-800 mb-4 flex items-center justify-between'>
                                Billing
                                <span className="text-[9px] md:text-[10px] bg-white px-2 py-1 rounded-full text-gray-400 shadow-sm border border-gray-100">
                                    {orderDetail?.paymentStatus}
                                </span>
                            </h2>

                            <div className="space-y-3 border-b border-gray-200 pb-4">
                                <div className="flex justify-between text-[13px] md:text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-bold text-gray-700">₹{orderDetail?.totalAmount}</span>
                                </div>
                                <div className="flex justify-between text-[13px] md:text-sm">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className="font-bold text-green-500">FREE</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <p className="text-md md:text-lg font-bold text-gray-800">Total</p>
                                <div className="text-right">
                                    <p className="text-xl md:text-2xl font-black text-pink-500 tracking-tighter">
                                        ₹{orderDetail?.totalAmount}
                                    </p>
                                    <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
                                        All Taxes Inc.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* actions */}
                <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-dashed border-gray-200">

                    {/* Left: Invoice Side */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500">
                            <FaRegFileAlt className='text-xl' />
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-gray-800">Need a copy of your bill?</h4>
                            <p className="text-xs text-gray-400">Download your official tax invoice (PDF)</p>
                        </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex flex-row md:flex-wrap items-center justify-center gap-3 w-full md:w-auto mt-6">

                        <button
                            onClick={() => downloadInvoice(orderId)}
                            disabled={isDownloading}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border-2 border-pink-500 text-pink-500 px-3 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm hover:bg-pink-50 transition-all active:scale-95 disabled:opacity-50 cursor-pointer truncate"
                        >
                            <MdOutlineFileDownload className="text-lg sm:text-xl shrink-0" />
                            <span className="truncate">
                                {isDownloading ? "Downloading..." : "Invoice"}
                            </span>
                        </button>

                        <button
                            onClick={() => navigate("/contact_us")}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-pink-500 text-white px-3 sm:px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-pink-100 dark:shadow-none hover:bg-pink-600 transition-all active:scale-95 cursor-pointer truncate"
                        >
                            <RiQuestionLine className="text-lg sm:text-xl shrink-0" />
                            <span className="truncate">Need Help?</span>
                        </button>

                    </div>
                </div>

            </div>
        </div>
    )
}

export default OrderTracker;