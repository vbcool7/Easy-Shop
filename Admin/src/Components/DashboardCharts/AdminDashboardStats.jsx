
import React from 'react';
import { HiOutlineCurrencyRupee, HiOutlineShoppingBag, HiOutlineUsers, HiOutlineClock } from "react-icons/hi";
import { IoStorefront } from "react-icons/io5";

import { useAdminDashboardStats } from '../../hooks/useAdminStats';
import { useTranslation } from 'react-i18next';

function AdminDashboardStats() {

    const { t } = useTranslation();
    const { data: dashboardStats, isLoading, isError } = useAdminDashboardStats();

    if (isLoading) return <div>{t('adminDashboardStats.loading')}</div>
    if (isError) return <div>{t('adminDashboardStats.error')}</div>

    const cardItems = [
        {
            id: 1,
            title: t('adminDashboardStats.totalSales'),
            para: t('adminDashboardStats.salesDesc'),
            icon: <HiOutlineCurrencyRupee />,
            value: `₹${dashboardStats?.data?.totalRevenue?.toLocaleString()}`,
            growth: "+15.2%",
            color: "bg-pink-500"
        },
        {
            id: 2,
            title: t('adminDashboardStats.totalVendors'),
            para: t('adminDashboardStats.vendorsDesc'),
            icon: <IoStorefront />,
            value: `${dashboardStats?.data?.totalVendors}`,
            growth: "+5 New",
            color: "bg-rose-400"
        },
        {
            id: 3,
            title: t('adminDashboardStats.totalCustomers'),
            para: t('adminDashboardStats.customersDesc'),
            icon: <HiOutlineUsers />,
            value: `${dashboardStats?.data?.totalUsers}`,
            growth: "+10.5%",
            color: "bg-pink-600"
        },
        {
            id: 4,
            title: t('adminDashboardStats.totalOrders'),
            para: t('adminDashboardStats.ordersDesc'),
            icon: <HiOutlineShoppingBag />,
            value: `${dashboardStats?.data?.totalOrders}`,
            growth: "+12.5%",
            color: "bg-rose-500"
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-4">
            {cardItems.map((card, index) => (
                <div
                    key={index}
                    className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-pink-50/50 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group truncate"
                >
                    <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110 duration-300 ${card.color}`}>
                            <div className="w-6 h-6 flex items-center justify-center text-2xl">
                                {card.icon}
                            </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg text-center ${card.growth.includes('+')
                            ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                            : "text-pink-600 bg-pink-50 dark:bg-pink-900/20"
                            }`}>
                            {card.growth}
                        </span>
                    </div>

                    <div className="mt-5">
                        <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
                            {card.title}
                        </p>

                        <div className="flex items-baseline gap-1 mt-1">
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                                {card.value}
                            </h2>
                        </div>

                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed line-clamp-2">
                            {card.para}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default AdminDashboardStats;