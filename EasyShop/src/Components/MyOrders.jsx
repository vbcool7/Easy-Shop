
import React, { useState } from 'react'
import { IoIosSearch } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { FiFilter } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

import { getPaginationRange } from '../utils/getPaginationRange';
import { useUserOrderHistory } from '../hook/useOrders';
import { useEffect } from 'react';

function MyOrders() {

    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [orderStatus, setOrderStatus] = useState('');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    // debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // reset page on status change
    useEffect(() => { setPage(1); }, [orderStatus]);

    const { data, isLoading, isFetching, isError } = useUserOrderHistory({ page, search: debouncedSearch, orderStatus });

    const orders = data?.data || [];
    const totalPages = data?.totalPages || 1;

    const status = ["Delivered", "Shipped", "Pending", "Cancelled", "Processing"];

    const clearAll = () => {
        setSearch('');
        setDebouncedSearch('');
        setOrderStatus('');
        setPage(1);
        setIsStatusOpen(false);
    };

    const statusStyles = {
        Delivered: 'bg-green-50 text-green-600',
        Pending: 'bg-amber-50 text-amber-600',
        Cancelled: 'bg-red-50 text-red-600',
        Processing: 'bg-blue-50 text-blue-600',
        Shipped: 'bg-purple-50 text-purple-600',
    };

    {
        isFetching && (
            <div className="text-center text-xs text-pink-400 font-semibold mb-4 uppercase tracking-widest">
                Updating...
            </div>
        )
    }
    if (isError) return <div className="py-20 text-center text-red-400">Failed to load orders</div>;

    return (
        <section className='w-full min-h-[70vh] py-8 md:py-16 px-4 lg:px-6'>

            {/* heading */}
            <div className="flex flex-col items-center mb-12">
                <h1 className='text-2xl md:text-3xl text-pink-500 font-bold tracking-tight'>
                    My Orders
                </h1>
                <div className="h-1 w-15 md:w-20 bg-pink-500 rounded-full mt-2 opacity-30"></div>
            </div>

            <div className='max-w-6xl mx-auto flex flex-col lg:flex-row gap-10'>

                {/* Mobile Filter Button */}
                <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center justify-between w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-4"
                >
                    <div className="flex items-center gap-2">
                        <FiFilter className="text-pink-500" />
                        <span className="font-bold text-gray-800 uppercase text-sm tracking-wide">
                            Filters & Sorting
                        </span>
                    </div>
                    <IoIosArrowDown className="text-gray-400" />
                </button>

                {/* left section */}
                <div className={`
                    fixed inset-0 z-100 bg-white p-6 overflow-y-auto transition-transform duration-300
                    ${showMobileFilters ? 'translate-x-0' : 'translate-x-full'}
                    lg:inset-auto lg:translate-x-0 lg:z-0 lg:w-[25%] lg:p-4 lg:block lg:h-fit lg:sticky lg:top-20 lg:rounded-2xl lg:border lg:border-gray-100 lg:shadow-sm
                    ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>

                    {/* Mobile Header */}
                    <div className="flex lg:hidden justify-between items-center mb-6 border-b pb-4">
                        <h2 className="font-black text-xl text-gray-800 uppercase">Filters</h2>
                        <button
                            onClick={() => setShowMobileFilters(false)}
                            className="p-2 bg-gray-50 rounded-full active:scale-90 transition-all"
                        >
                            <IoMdClose className="text-2xl text-gray-800" />
                        </button>
                    </div>

                    {/* Header & Clear All */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="hidden lg:block font-bold text-gray-800 text-sm uppercase tracking-widest">
                                Filter
                            </h1>
                            {orderStatus && (
                                <button
                                    onClick={clearAll}
                                    className="text-xs text-pink-500 font-semibold uppercase hover:underline cursor-pointer"
                                >Clear all</button>
                            )}
                        </div>

                        {orderStatus && (
                            <div className="mt-3 text-sm text-gray-600">
                                Status: {orderStatus}
                            </div>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div className='border-b border-gray-100 py-5'>
                        <div
                            onClick={() => setIsStatusOpen(!isStatusOpen)}
                            className="flex justify-between items-center cursor-pointer group">
                            <h1 className="font-bold text-sm text-gray-700 group-hover:text-pink-500 transition-colors uppercase">
                                ORDER STATUS
                            </h1>
                            {isStatusOpen ? <IoIosArrowUp className="text-xl" /> : <IoIosArrowDown className="text-xl" />}
                        </div>

                        {isStatusOpen && (
                            <div className="flex flex-col items-start mt-2 pt-2 space-y-2">
                                {status.map((item, index) => (
                                    <label
                                        key={index}
                                        className="flex items-center gap-4 text-left w-full cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="orderStatus"
                                            className="w-4 h-4 accent-pink-500"
                                            checked={orderStatus === item}
                                            onChange={() => setOrderStatus(orderStatus === item ? '' : item)}
                                        />
                                        <span className='text-sm text-gray-600 group-hover:text-gray-900'>
                                            {item}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mobile Fixed Footer */}
                    <div className="lg:hidden fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100 flex gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                        <button
                            onClick={() => setShowMobileFilters(false)}
                            className="flex-1 py-4 bg-pink-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-pink-100 active:scale-95 transition-all"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* right section */}
                <div className='w-full lg:w-[75%]'>

                    {/* Search Bar */}
                    <div className="relative mb-8 group">
                        <div className="flex items-center bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden focus-within:ring-2 focus-within:ring-pink-100 transition-all">
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by order ID or product name"
                                className="w-full h-12 pl-5 pr-40 bg-white border border-gray-100 rounded-2xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all text-sm font-medium text-gray-700 placeholder:text-gray-400 shadow-sm group-hover:shadow-md"
                            />
                            <div className="absolute right-1 top-1 bottom-1 px-5 flex items-center gap-2 bg-pink-500 hover:bg-pink-600 active:scale-95 text-white rounded-xl transition-all cursor-pointer">
                                <IoIosSearch className="text-xl" />
                                <span className="hidden sm:block font-bold text-sm tracking-wide">Search</span>
                            </div>
                        </div>
                    </div>

                    {/* Orders List */}
                    {orders.length > 0 ? (
                        orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white rounded-3xl p-6 mb-6 border-2 border-gray-100 shadow-sm hover:shadow-md transition-all"
                            >
                                {/* Top Section / Header - Details and Status here in single line */}
                                <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-50">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Order ID</p>
                                        <h3 className="text-sm font-black text-pink-500">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* Status Badge */}
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusStyles[order.orderStatus] || 'bg-slate-100 text-slate-500'}`}>
                                            {order.orderStatus}
                                        </span>

                                        {/* FIXED: Details button poore order ke liye sirf ek baar top par dikhega */}
                                        <button
                                            onClick={() => navigate(`/order_track/${order._id}`)}
                                            className="py-1.5 px-4 bg-gray-900 text-white rounded-xl text-[11px] font-bold uppercase hover:bg-gray-800 transition-colors cursor-pointer"
                                        >
                                            Details
                                        </button>
                                    </div>
                                </div>

                                {/* Items Container - Multiple items safely render */}
                                <div className="space-y-6">
                                    {order.items.map((item, index) => (
                                        <div
                                            key={item._id}
                                            className={`flex flex-col sm:flex-row gap-6 items-center justify-between ${index !== 0 ? "pt-6 border-t border-gray-50" : ""
                                                }`}
                                        >
                                            {/* Left Side: Image + Product Info Layout */}
                                            <div className="flex flex-col sm:flex-row gap-4 items-center flex-1 min-w-0 w-full">
                                                {/* Product Image */}
                                                <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                                                    <img
                                                        src={
                                                            item.productId?.attributes?.Color?.images?.[item.selectedColor]?.[0]
                                                            || item.productId?.prodImage
                                                        }
                                                        alt={item.productId?.prodName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Product Info */}
                                                <div className="text-center sm:text-left min-w-0">
                                                    <h4 className="font-bold text-gray-900 text-sm truncate">{item.productId?.prodName}</h4>
                                                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mt-1.5">
                                                        {item.selectedColor && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                                Color: <span className="font-bold text-gray-800">{item.selectedColor}</span>
                                                            </span>
                                                        )}
                                                        {item.selectedSize && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-pink-50 text-pink-600 border border-pink-100">
                                                                Size: <span className="font-bold text-pink-700">{item.selectedSize}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Qty: <span className="font-medium text-gray-700">{item.quantity}</span> •
                                                        <span className="font-bold text-gray-800 ml-1">₹{item.price}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Right Side: Action Button Per Item */}
                                            <div className="w-full sm:w-auto text-right">

                                                {/* FIXED: Write a Review button only for DELIVERED orders */}
                                                {order.orderStatus === 'Delivered' ? (
                                                    <button
                                                        onClick={() => navigate(`/review_rating/${order._id}/${item.productId._id}`)}
                                                        className="w-full sm:w-36 py-2 px-4 bg-pink-500 text-white rounded-xl text-[11px] font-bold uppercase shadow-md shadow-pink-100 hover:bg-pink-600 transition-colors cursor-pointer"
                                                    >
                                                        Write a Review
                                                    </button>
                                                ) : (
                                                    // Optional Placeholder 
                                                    <span className="text-[10px] text-gray-400 font-medium italic block sm:w-36 text-center sm:text-right">
                                                        Review available after delivery
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center text-gray-400">
                            <p className="font-bold uppercase text-sm tracking-widest">
                                {search || orderStatus ? 'No orders match your search' : 'No orders yet'}
                            </p>
                            {(search || orderStatus) && (
                                <button onClick={clearAll} className="mt-4 text-pink-500 font-bold text-xs uppercase hover:underline">
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}

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
        </section>
    );
}

export default MyOrders;