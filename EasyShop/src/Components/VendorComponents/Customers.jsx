
import React, { useEffect, useState } from 'react';
import { HiDotsVertical } from "react-icons/hi";
import { HiOutlineSearch } from "react-icons/hi";
import CustomerProfileDrawer from './CustomerProfileDrawer';
import { HiOutlineUser } from "react-icons/hi";
import { HiOutlineBan } from "react-icons/hi";
import { HiOutlineUserGroup } from "react-icons/hi";
import { HiOutlineStatusOnline } from "react-icons/hi";
import { HiOutlineSparkles } from "react-icons/hi";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { FaEye } from "react-icons/fa";

import { useVendorCustomers, useVendorCustomerStats } from '../../hook/useUser';
import { getPaginationRange } from '../../utils/getPaginationRange';
import { useTranslation } from 'react-i18next';

function Customers() {
    
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isSelectedCustomerId, setIsSelectedCustomerId] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: customerStats } = useVendorCustomerStats();
    const { data: customerResponse, isLoading, isError } = useVendorCustomers({
        search: debouncedSearch,
        page
    });

    const customerList = customerResponse?.data || [];
    const totalPages = customerResponse?.totalPages || 1;
    const count = customerResponse?.count || 0;

    const cards = [
        {
            label: t('customers.statTotal'),
            value: customerStats?.totalCustomers || 0,
            growth: '+12.5%',
            icon: HiOutlineUserGroup,
            color: 'text-blue-500',
            bg: 'bg-blue-50'
        },
        {
            label: t('customers.statActive'),
            value: customerStats?.activeNow || 0,
            growth: t('customers.growthLive'),
            icon: HiOutlineStatusOnline,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50'
        },
        {
            label: t('customers.statSpend'),
            value: customerStats?.avgSpend
                ? `₹${Number(customerStats.avgSpend).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                : '₹0',
            growth: '-2.4%',
            icon: HiOutlineCurrencyRupee,
            color: 'text-pink-500',
            bg: 'bg-pink-50'
        },
    ];

    if (isLoading) return <p className="p-10 text-center">{t('customers.loading')}</p>;
    if (isError) return <p className="p-10 text-center text-red-500">{t('customers.error')}</p>;

    return (
        <div className="space-y-6">

            {/* stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {cards.map((stat, idx) => (
                    <div
                        key={idx}
                        className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">

                        <div className="flex justify-between items-start truncate">
                            <div className={`p-2.5 rounded-xl ${stat.bg} dark:bg-opacity-10 ${stat.color}`}>
                                <stat.icon size={22} />
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.growth.includes('+') ? 'bg-emerald-50 text-emerald-600' :
                                stat.growth === t('customers.growthLive') ? 'bg-blue-50 text-blue-600 animate-pulse' :
                                    'bg-red-50 text-red-600'
                                }`}>
                                {stat.growth}
                            </span>
                        </div>

                        <div className="mt-4">
                            <h4 className="text-2xl font-black text-slate-800 dark:text-white truncate">
                                {stat.value}
                            </h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1 truncate">
                                {stat.label}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

                {/* Header and Search */}
                <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-800/20">

                    <div className='flex gap-2 items-center'>
                        <h2 className="text-md md:text-lg font-bold text-slate-800 dark:text-white shrink-0">
                            {t('customers.tableTitle')}
                        </h2>
                        <span className="hidden lg:flex bg-pink-100 text-pink-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {t('customers.totalCounter', { total: count })}
                        </span>
                    </div>

                    <div className="relative w-full md:w-80 group">
                        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('customers.searchPlaceholder')}
                            className="w-full pl-11 pr-4 py-2 md:py-2.5 bg-slate-50 border border-pink-50 dark:bg-slate-800 focus:border-pink-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm outline-none transition-all shadow-sm placeholder:text-xs md:placeholder:text-[13px]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 dark:border-slate-800 text-[11px] uppercase tracking-widest text-slate-400 font-bold">
                                <th className="px-6 py-4 text-center w-16">{t('customers.thId')}</th>
                                <th className="px-6 py-4">{t('customers.thCustomer')}</th>
                                <th className="px-6 py-4">{t('customers.thStatus')}</th>
                                <th className="px-6 py-4 text-center">{t('customers.thOrders')}</th>
                                <th className="px-6 py-4">{t('customers.thSpend')}</th>
                                <th className="px-6 py-4">{t('customers.thLastOrder')}</th>
                                <th className="px-6 py-4 text-right">{t('customers.thAction')}</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {customerList.length > 0 ? customerList?.map((customer) => {
                                return (
                                    <tr key={customer._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-bold text-slate-400">#{customer._id.slice(-6).toUpperCase()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img  
                                                src={customer.profilePhoto || 'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png'} 
                                                 alt={customer.name} 
                                                 className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm object-cover" />
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{customer.name}</h4>
                                                    <p className="text-[10px] text-slate-400 truncate">{customer.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase border ${customer.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                {customer.isActive ? t('customers.statusActive') : t('customers.statusInactive')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{customer.totalOrders}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-slate-800 dark:text-white">₹{customer.totalSpend || 0}</span>
                                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">{customer.state || 'India'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                            {new Date(customer.lastOrderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="relative px-6 py-4 text-right">
                                            <button onClick={() => setIsSelectedCustomerId(customer._id)} className="p-2 hover:bg-pink-50 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-pink-500 transition-all cursor-pointer">
                                                <FaEye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-slate-400 text-sm">
                                        {t('customers.noResultsFound')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 py-4 px-6 border-t border-pink-50 dark:border-slate-800">
                        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-pink-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                            {t('customers.paginationPrev')}
                        </button>
                        {getPaginationRange(page, totalPages).map((num, idx) =>
                            num === '...' ? <span key={`dot-${idx}`} className="px-2 py-1.5 text-xs text-slate-400">...</span> :
                                <button key={num} onClick={() => setPage(num)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${page === num ? 'bg-pink-500 text-white border-pink-500' : 'border-pink-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800'}`}>
                                    {num}
                                </button>
                        )}
                        <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-pink-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                            {t('customers.paginationNext')}
                        </button>
                    </div>
                )}
            </div>

            <CustomerProfileDrawer
                customerId={isSelectedCustomerId}
                isOpen={!!isSelectedCustomerId}
                onClose={() => setIsSelectedCustomerId(null)}
            />
        </div>
    )
}

export default Customers;