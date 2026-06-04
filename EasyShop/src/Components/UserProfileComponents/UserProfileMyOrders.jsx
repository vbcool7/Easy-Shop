
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineEye, HiOutlineShoppingBag } from 'react-icons/hi';

import { getPaginationRange } from '../../utils/getPaginationRange';
import { useUserOrderHistory } from '../../hook/useOrders';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function UserProfileMyOrders() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);

    const { data, isLoading, isFetching, isError } = useUserOrderHistory({ page });

    const orders = data?.data || [];
    const totalPages = data?.totalPages || 1;

    const statusStyles = {
        Delivered: 'bg-green-100 text-green-600',
        Pending: 'bg-amber-100 text-amber-600',
        Cancelled: 'bg-red-100 text-red-600',
        Processing: 'bg-blue-100 text-blue-600',
        Shipped: 'bg-purple-100 text-purple-600',
    };

    if (isLoading) return <div className="py-20 text-center text-slate-400">{t('userProfile.ordersLoading')}</div>;
    if (isError) return <div className="py-20 text-center text-red-400">{t('userProfile.ordersError')}</div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Orders Table */}
            <div className="w-full overflow-x-auto scrollbar-hide mt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="w-full text-left border-separate border-spacing-y-3 min-w-150">
                    <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                            <th className="pb-2 pl-4">{t('userProfile.colOrderId')}</th>
                            <th className="pb-2">{t('userProfile.colDate')}</th>
                            <th className="pb-2">{t('userProfile.colItems')}</th>
                            <th className="pb-2">{t('userProfile.colAmount')}</th>
                            <th className="pb-2">{t('userProfile.colStatus')}</th>
                            <th className="pb-2 text-center">{t('userProfile.colAction')}</th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders.map((order, index) => (
                            <tr
                                key={index}
                                className="bg-slate-50/50 hover:bg-slate-100/50 transition-colors group"
                            >
                                {/* order id */}
                                <td className="py-5 pl-4 rounded-l-2xl">
                                    <span className="text-sm font-bold text-slate-700">
                                        #{order._id.slice(-6).toUpperCase()}
                                    </span>
                                </td>

                                {/* order date */}
                                <td className="py-5 text-xs font-semibold text-slate-500">
                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                </td>

                                {/* items */}
                                <td className="py-5 text-xs font-semibold text-slate-500">
                                    {t('userProfile.itemCount', { count: order.items.length })}
                                </td>

                                {/* order amt */}
                                <td className="py-5 text-sm font-black text-slate-800">
                                    ₹{order.totalAmount}
                                </td>

                                {/* status */}
                                <td className="py-5">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusStyles[order.orderStatus] || 'bg-slate-100 text-slate-500'}`}>
                                        {order.orderStatus}
                                    </span>
                                </td>

                                {/* action */}
                                <td className="py-5 pr-4 rounded-r-2xl text-center">
                                    <button
                                        onClick={() => navigate(`/order_track/${order._id}`)}
                                        className="p-2 bg-white rounded-xl text-slate-400 hover:text-pink-500 hover:shadow-md transition-all cursor-pointer"
                                    >
                                        <HiOutlineEye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Empty State (If no orders) */}
            {orders.length === 0 && (
                <div className="py-20 text-center">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                        {t('userProfile.ordersEmptyTitle')}
                    </p>
                    <button className="mt-4 text-pink-500 font-black text-xs uppercase hover:underline">
                        {t('userProfile.ordersEmptyAction')}
                    </button>
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
                        {t('userProfile.prev')}
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
                        {t('userProfile.next')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserProfileMyOrders;