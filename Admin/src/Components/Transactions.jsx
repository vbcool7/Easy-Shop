
import React from 'react';

import { useToggleTransactionStatus, useTransactionList } from '../hooks/useTransactions';
import { getPaginationRange } from '../utils/getPaginationRange';
import { useEffect } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function Transactions() {

    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isError } = useTransactionList({ search: debouncedSearch, page });
    const { mutate: toggleStatus, isPending: isUpdating } = useToggleTransactionStatus();

    const transactionList = data?.data || [];
    const totalPages = data?.totalPages || 1;
    const totalCount = data?.count || 0;

    const transactionStatusStyles = {
        Completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
        Pending: "bg-amber-50 text-amber-600 border-amber-100",
        Cancelled: "bg-rose-50 text-rose-600 border-rose-100",
    };

    const handleStatusChange = (transactionId, newStatus) => {
        const isConfirmed = window.confirm(`Are you sure you want to mark this as ${newStatus}?`);

        if (isConfirmed) {
            toggleStatus({ transaction_id: transactionId, status: newStatus });
        }
    };

    if (isLoading) return <p className="p-10 text-center animate-pulse">{t('adminTransactions.loading')}</p>;
    if (isError) return <p className="p-10 text-center text-red-500">{t('adminTransactions.error')}</p>;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

            {/* heading */}
            <div className="p-4 md:p-6 border-b border-pink-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                <div>
                    <div className='flex items-center gap-2.5'>
                        <h2 className="text-md md:text-lg font-bold text-slate-800 dark:text-white shrink-0">
                            {t('adminTransactions.title')}
                        </h2>
                        <span className="bg-pink-100 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 px-2.5 py-0.5 md:py-1 rounded-full text-[11px] md:text-xs font-bold">
                            {t('adminTransactions.totalBadge')} {totalCount}
                        </span>
                    </div>
                    <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {t('adminTransactions.description')}
                    </p>
                </div>

                {/* Search */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('adminTransactions.searchPlaceholder')}
                        className="w-full sm:w-64 text-sm px-2 md:px-4 py-2 md:py-2.5 rounded-xl border border-pink-50 bg-slate-50 dark:bg-slate-800 focus:outline-pink-400 focus:bg-white transition-all shadow-sm placeholder:text-xs md:placeholder:text-[13px]"
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">

                    <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                        <tr className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                            <th className="px-6 py-4 ">{t('adminTransactions.colTransaction')}</th>
                            <th className="px-6 py-4 ">{t('adminTransactions.colVendor')}</th>
                            <th className="px-6 py-4 ">{t('adminTransactions.colPaymentInfo')}</th>
                            <th className="px-6 py-4 text-center">{t('adminTransactions.colPlatformFee')}</th>
                            <th className="px-6 py-4 ">{t('adminTransactions.colNetPayout')}</th>
                            <th className="px-6 py-4 ">{t('adminTransactions.colStatus')}</th>
                            <th className="px-6 py-4 ">{t('adminTransactions.colAction')}</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {transactionList.length > 0 ? transactionList.map((txn) => {
                            return (
                                <tr
                                    key={txn._id}
                                    className="hover:bg-pink-50/20 transition-all group">

                                    {/* txn id + orderId */}
                                    <td className="px-6 py-5">
                                        <div className="text-[12px] font-bold text-slate-700">
                                            {txn.txnId}
                                        </div>
                                        <div className="text-[11px] font-medium text-pink-500">
                                            {txn.orderDisplayId}
                                        </div>
                                    </td>

                                    {/* vendor name */}
                                    <td className="px-6 py-5">
                                        <div className="text-sm font-bold text-slate-800">
                                            {txn.vendorInfo?.name || "---"}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium">
                                            {t('adminTransactions.verifiedSeller')}
                                        </div>
                                    </td>

                                    {/* total amt + pay method */}
                                    <td className="px-6 py-5">
                                        <div className="text-sm font-bold text-slate-700">
                                            ₹{txn.totalAmount.toLocaleString() || '---'}
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                                                {txn.paymentMethod || '---'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* platform fee */}
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-sm font-bold text-rose-500 px-2 py-1 rounded-lg">
                                            -₹{txn.platformFee || '---'}
                                        </span>
                                    </td>

                                    {/* net earning */}
                                    <td className="px-6 py-5">
                                        <div className="text-md font-black text-slate-800">
                                            ₹{txn.netEarning.toLocaleString()}
                                        </div>
                                    </td>

                                    {/* status */}
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border 
                                        ${transactionStatusStyles[txn.status]}`}>
                                            {txn.status}
                                        </span>
                                    </td>

                                    {/* action */}
                                    <td className="px-6 py-5">
                                        {txn.status === 'Pending' ? (
                                            <div className="flex gap-2">
                                                {/* 1. Settle Button (Main Action) */}
                                                <button
                                                    onClick={() => handleStatusChange(txn._id, 'Completed')}
                                                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase hover:bg-emerald-600 transition-colors"
                                                >
                                                    {t('adminTransactions.settleNow')}
                                                </button>

                                                {/* 2. Cancel Button (Secondary Action) */}
                                                <button
                                                    onClick={() => handleStatusChange(txn._id, 'Cancelled')}
                                                    className="px-3 py-1.5 border border-slate-200 text-slate-400 rounded-lg text-[10px] font-bold uppercase hover:bg-rose-50 hover:text-rose-500 transition-all"
                                                >
                                                    {t('adminTransactions.cancel')}
                                                </button>
                                            </div>
                                        ) : (
                                            // Agar status 'Completed' ya 'Cancelled' hai toh sirf text dikhega
                                            <div className={`flex items-center gap-1 font-bold text-[10px] uppercase ${txn.status === 'Completed' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                {txn.status === 'Completed' ? (
                                                    <>
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                                                        {t('adminTransactions.processed')}
                                                    </>
                                                ) : (
                                                    t('adminTransactions.voidCancelled')
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan="7" className="text-center py-10 text-slate-400 text-sm">
                                    {t('adminTransactions.emptySearch')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 py-4 px-6 border-t border-pink-50 dark:border-slate-800">
                        <button
                            onClick={() => setPage(p => Math.max(p - 1, 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-pink-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            {t('adminTransactions.prev')}
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
                            {t('adminTransactions.next')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;