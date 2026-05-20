
import React, { useState } from 'react'
import { IoIosSearch } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { FiFilter } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from 'react-router-dom';

import { useUserOrderHistory } from '../hook/useOrders';

function MyOrders() {

    const navigate = useNavigate();
    const { data: orders = [], isLoading, isError } = useUserOrderHistory();

    const [isTimeOpen, setIsTimeOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState([]);

    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState([]);

    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // ====== left section - filter ======
    const time = ["Last 30 days", "2025", "2024", "Older",];

    const status = [
        "Delivered",
        "Shipped",
        "Pending",
        "Cancelled",
        "Processing"
    ];

    const filteredOrders = orders.filter(order => {

        // status filter
        if (selectedStatus.length > 0 && !selectedStatus.includes(order.orderStatus)) {
            return false;
        }

        // time filter
        if (selectedTime.length > 0) {
            const orderDate = new Date(order.createdAt);
            const now = new Date();

            const matchesTime = selectedTime.some(t => {
                if (t === 'Last 30 days') {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(now.getDate() - 30);
                    return orderDate >= thirtyDaysAgo;
                }
                if (t === '2025') return orderDate.getFullYear() === 2025;
                if (t === '2024') return orderDate.getFullYear() === 2024;
                if (t === 'Older') return orderDate.getFullYear() < 2024;
                return true;
            });

            if (!matchesTime) return false;
        }

        return true;
    });

    // Generic handler function (can be reused for all dropdowns)
    const handleCheckboxChange = (item, selected, setSelected) => {
        if (selected.includes(item)) {
            setSelected(selected.filter((i) => i !== item));
        } else {
            setSelected([...selected, item]);
        }
    };

    //handle clear btn
    const clearAll = () => {
        setSelectedTime([]);
        setSelectedStatus([]);

        setIsTimeOpen(false);
        setIsStatusOpen(false);
    }

    // ===== right section =====
    const statusStyles = {
        Delivered: 'bg-green-50 text-green-600',
        Pending: 'bg-amber-50 text-amber-600',
        Cancelled: 'bg-red-50 text-red-600',
        Processing: 'bg-blue-50 text-blue-600',
        Shipped: 'bg-purple-50 text-purple-600',
    };

    if (isLoading) return <div className="py-20 text-center text-slate-400">Loading orders...</div>;
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

                {/* Mobile Filter Button (Sirf Mobile par dikhega) */}
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

                    {/* Mobile Header: Close Icon (Sirf Mobile par dikhega) */}
                    <div className="flex lg:hidden justify-between items-center mb-6 border-b pb-4">
                        <h2 className="font-black text-xl text-gray-800 uppercase">Filters</h2>
                        <button
                            onClick={() => setShowMobileFilters(false)}
                            className="p-2 bg-gray-50 rounded-full active:scale-90 transition-all"
                        >
                            <IoMdClose className="text-2xl text-gray-800" />
                        </button>
                    </div>

                    {/* Header & Clear All (Desktop standard) */}
                    <div>
                        <div className="flex items-center justify-between mb-4">

                            <h1 className="hidden lg:block font-bold text-gray-800 text-sm uppercase tracking-widest">
                                Filter
                            </h1>

                            {(selectedStatus.length > 0 || selectedTime.length > 0) && (
                                <button
                                    onClick={clearAll}
                                    className="text-xs text-pink-500 font-semibold uppercase hover:underline cursor-pointer"
                                >Clear all</button>
                            )}
                        </div>

                        {/* Display time selected items */}
                        {selectedTime.length > 0 && (
                            <div className="mt-3 text-sm text-gray-600">
                                Time : {selectedTime.join(", ")}
                            </div>
                        )}

                        {/* Display status selected items */}
                        {selectedStatus.length > 0 && (
                            <div className="mt-3 text-sm text-gray-600">
                                Status : {selectedStatus.join(", ")}
                            </div>
                        )}
                    </div>

                    {/* status */}
                    <div className='border-b border-gray-100 py-5'>
                        <div
                            onClick={() => setIsStatusOpen(!isStatusOpen)}
                            className="flex justify-between items-center cursor-pointer group">

                            <h1 className="font-bold text-sm text-gray-700 group-hover:text-pink-500 transition-colors uppercase">
                                ORDER STATUS
                            </h1>
                            {
                                isStatusOpen ? (
                                    <IoIosArrowUp className="text-xl" />
                                ) : (
                                    <IoIosArrowDown className="text-xl" />
                                )
                            }
                        </div>
                        {isStatusOpen && (
                            <div className="flex flex-col items-start mt-2 pt-2 space-y-2">

                                {status.map((item, index) => (
                                    <label
                                        key={index}
                                        className="flex items-center gap-4 text-left w-full cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 accent-pink-500"
                                            checked={selectedStatus.includes(item)}
                                            onChange={() => handleCheckboxChange(item, selectedStatus, setSelectedStatus)} />

                                        <span className='text-sm text-gray-600 group-hover:text-gray-900'>
                                            {item}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}

                    </div>

                    {/* time */}
                    <div className='border-b border-gray-100 py-5'>
                        <div
                            onClick={() => setIsTimeOpen(!isTimeOpen)}
                            className="flex justify-between items-center cursor-pointer group">

                            <h1 className="font-bold text-sm text-gray-700 group-hover:text-pink-500 transition-colors uppercase">
                                ORDER TIME
                            </h1>
                            {
                                isTimeOpen ? (
                                    <IoIosArrowUp className="text-xl" />
                                ) : (
                                    <IoIosArrowDown className="text-xl" />
                                )
                            }
                        </div>
                        {isTimeOpen && (
                            <div className="flex flex-col items-start mt-2 pt-2 space-y-2">

                                {time.map((t, index) => (
                                    <label
                                        key={index}
                                        className="flex items-center gap-4 text-left w-full cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 accent-pink-500"
                                            checked={selectedTime.includes(t)}
                                            onChange={() => handleCheckboxChange(t, selectedTime, setSelectedTime)} />

                                        {/* Name */}
                                        <span className='text-sm text-gray-600 group-hover:text-gray-900'>
                                            {t}
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

                    {/* Search Bar Container */}
                    <div className="relative mb-8 group">
                        <div className="flex items-center bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden focus-within:ring-2 focus-within:ring-pink-100 transition-all">

                            <input
                                type="text"
                                id="search"
                                placeholder="Search your orders"
                                className="w-full h-12 pl-5 pr-40 bg-white border border-gray-100 rounded-2xl outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all text-sm font-medium text-gray-700 placeholder:text-gray-400 shadow-sm group-hover:shadow-md"
                            />

                            <div className="absolute right-1 top-1 bottom-1 px-5 flex items-center gap-2 bg-pink-500 hover:bg-pink-600 active:scale-95 text-white rounded-xl transition-all cursor-pointer ">
                                <IoIosSearch className="text-xl" />
                                <span className="hidden sm:block font-bold text-sm tracking-wide">Search</span>
                            </div>
                        </div>
                    </div>

                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order, index) => (
                            <div
                                key={order._id}
                                className="bg-white rounded-3xl p-6 mb-4 border-2 border-gray-100 shadow-sm hover:shadow-md transition-all"
                            >
                                {/* Top Section: ID and Status */}
                                <div className="flex justify-between items-start pb-4 mb-6 border-b border-gray-50">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                            Order ID
                                        </p>
                                        <h3 className="text-sm font-black text-pink-500">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </h3>
                                    </div>

                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${statusStyles[order.orderStatus] || 'bg-slate-100 text-slate-500'}`}>
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Section */}
                                {order.items.map((item, itemIdx) => {
                                    return (
                                        <div
                                            key={item._id}
                                            className="flex flex-col sm:flex-row gap-6 items-center">

                                            {/* Product Image */}
                                            <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
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
                                            <div className="flex-1 text-center sm:text-left min-w-0">
                                                <h4 className="font-bold text-gray-900 text-base">
                                                    {item.productId?.prodName}
                                                </h4>

                                                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 mt-2">
                                                    {item.selectedColor && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                            Color: <span className="font-bold text-gray-800">{item.selectedColor}</span>
                                                        </span>
                                                    )}

                                                    {item.selectedSize && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-pink-50 text-pink-600 border border-pink-100">
                                                            Size: <span className="font-bold text-pink-700">{item.selectedSize}</span>
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-gray-500 mt-2">
                                                    Qty: <span className="font-medium text-gray-700">{item.quantity}</span> •
                                                    <span className="font-bold text-gray-800 ml-1">
                                                        ₹{item.price}
                                                    </span>
                                                </p>
                                            </div>

                                            {/* Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                                <button
                                                    onClick={() => navigate(`/order_track/${order._id}`)}
                                                    className="flex-1 sm:w-32 py-2.5 bg-gray-900 text-white rounded-xl text-[11px] font-bold uppercase hover:bg-gray-800 transition-colors cursor-pointer"
                                                >
                                                    Details
                                                </button>

                                                <button
                                                    onClick={() => navigate(`/review_rating/${order._id}`)}
                                                    className="flex-1 sm:w-32 py-2.5 bg-pink-500 text-white rounded-xl text-[11px] font-bold uppercase shadow-lg shadow-pink-100 hover:bg-pink-600 transition-colors cursor-pointer"
                                                >
                                                    Write a Review
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}

                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center text-gray-400">
                            <p className="font-bold uppercase text-sm tracking-widest">No orders found</p>
                            <button
                                onClick={clearAll}
                                className="mt-4 text-pink-500 font-bold text-xs uppercase hover:underline">
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section >
    )
}

export default MyOrders;