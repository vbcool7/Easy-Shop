
import React, { useEffect, useState } from 'react';
import { HiOutlineSearch } from "react-icons/hi";
import { HiOutlineBan } from "react-icons/hi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { HiOutlineSparkles } from "react-icons/hi";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { MdBlock } from "react-icons/md";
import { FaRegUser } from "react-icons/fa6";
import { FiUsers } from "react-icons/fi";
import { FiCheckCircle } from "react-icons/fi";
import { FiXCircle } from "react-icons/fi";
import { FiTrendingUp } from "react-icons/fi";

import { useToggleVendorStatus, useVendorList, useVendorStats } from '../hooks/useVendors';
import VendorProfileDrawer from './VendorProfileDrawer';

function VendorList() {

    const [searchVal, setSearchVal] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);

    const { data: stats } = useVendorStats();
    const { data: vendorData, isLoading, isError } = useVendorList({ search: debouncedSearch, page });
    const { mutate: toggleVendorStatus, isPending, variables } = useToggleVendorStatus();

    const [isProfileOpen, setIsProfileOpen] = useState(null);

    // debounce search + reset page
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchVal);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchVal]);

    const vendorList = vendorData?.data || [];
    const totalPages = vendorData?.totalPages || 1;

    const cards = [
        { label: 'Total Vendors', value: stats?.total, sub: 'all registered', color: '#185FA5', bg: '#E6F1FB', icon: <FiUsers /> },
        { label: 'Active', value: stats?.active, sub: 'currently live', color: '#3B6D11', bg: '#EAF3DE', icon: <FiCheckCircle /> },
        { label: 'Inactive', value: stats?.inactive, sub: 'needs attention', color: '#A32D2D', bg: '#FCEBEB', icon: <FiXCircle /> },
        { label: 'New This Month', value: stats?.newThisMonth, sub: 'joined recently', color: '#854F0B', bg: '#FAEEDA', icon: <FiTrendingUp /> },
    ];

    if (isLoading) return <p className="p-10 text-center">Loading vendors list...</p>;
    if (isError) return <p className="p-10 text-center text-red-500">Error fetching vendors!</p>;

    return (
        <div className="space-y-6">

            {/* cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {cards.map((card) => (
                    <div
                        key={card.label}
                        className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative overflow-hidden"
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    {card.label}
                                </p>
                                <h3 className="text-2xl md:text-3xl font-black" style={{ color: card.color }}>
                                    {card.value ?? 0}
                                </h3>
                            </div>
                            <div className="p-2.5 rounded-xl text-xl shadow-sm" style={{ backgroundColor: card.bg, color: card.color }}>
                                {card.icon}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: card.color }} />
                            <p className="text-[10px] md:text-xs font-medium text-slate-400 italic">{card.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

                {/* heading */}
                <div className="p-4 md:p-6 border-b border-pink-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className='flex gap-2 items-center'>
                            <h2 className="text-md md:text-lg font-bold text-slate-800 dark:text-white shrink-0">
                                Vendors
                            </h2>
                            <span className="hidden lg:flex bg-pink-100 text-pink-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                {vendorData?.count || 0} counts
                            </span>
                        </div>
                        <p className="text-[11px] md:text-xs text-slate-500 mt-1">See platform vendors</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <input
                            type="text"
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            placeholder="Search vendors..."
                            className="w-full sm:w-64 text-sm px-2 md:px-4 py-2 md:py-2.5 rounded-xl border border-pink-50 bg-slate-50 dark:bg-slate-800 focus:outline-pink-400 focus:bg-white transition-all shadow-sm placeholder:text-xs md:placeholder:text-[13px]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 dark:border-slate-800 text-[11px] uppercase tracking-widest text-slate-400 font-bold">
                                <th className="px-6 py-4 text-center w-16">#ID</th>
                                <th className="px-6 py-4">Vendor/Store</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Created Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {vendorList.length > 0 ? (
                                vendorList.map((vendor) => {
                                    const isThisRowLoading = isPending && variables === vendor._id;

                                    return (
                                        <tr key={vendor._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-xs font-bold text-slate-300">ID</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={vendor.profilePhoto || 'default-avatar.png'}
                                                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                                        alt="store"
                                                    />
                                                    <div className="min-w-0">
                                                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{vendor.storeName}</h4>
                                                        <p className="text-[10px] text-slate-400 truncate">{vendor.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{vendor.contact}</span>
                                                    <span className="text-[10px] text-slate-400">{vendor.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-xs font-semibold text-slate-600 p-1 rounded">{vendor.category || "---"}</span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                                {new Date(vendor.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleVendorStatus(vendor._id)}
                                                    disabled={isPending}
                                                    className={`w-16 inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold uppercase border transition-all
                                                        ${isThisRowLoading ? 'opacity-50' : 'cursor-pointer'}
                                                        ${vendor.isActive ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' : 'bg-slate-50 text-red-400 border-red-200 hover:bg-red-100'}`}
                                                >
                                                    {isThisRowLoading ? (
                                                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        vendor.isActive ? "Active" : "Inactive"
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setIsProfileOpen(vendor)}
                                                    className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 active:scale-95 shadow-sm border border-indigo-100"
                                                >
                                                    <FaRegUser className="text-lg" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-slate-400 text-sm">
                                        No vendors found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-slate-50 dark:border-slate-800">
                        <button
                            onClick={() => setPage(p => p - 1)}
                            disabled={page === 1}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-all"
                        >
                            Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                            <button
                                key={num}
                                onClick={() => setPage(num)}
                                className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all
                                    ${page === num
                                        ? 'bg-pink-500 text-white border-pink-500'
                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {num}
                            </button>
                        ))}

                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            <VendorProfileDrawer
                vendor={isProfileOpen}
                isOpen={!!isProfileOpen}
                onClose={() => setIsProfileOpen(null)}
            />
        </div>
    );
}

export default VendorList;