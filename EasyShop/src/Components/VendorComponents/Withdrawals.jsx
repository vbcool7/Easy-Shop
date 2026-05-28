
import React, { useEffect, useState } from 'react';
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { HiOutlineClock } from "react-icons/hi";
import { HiOutlineExternalLink } from "react-icons/hi";
import { HiOutlineDownload, HiOutlineSearch } from 'react-icons/hi';
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { HiOutlinePlusCircle } from "react-icons/hi";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import { HiOutlinePrinter } from "react-icons/hi";
import { HiOutlineLibrary } from "react-icons/hi";
import { HiOutlineRefresh } from "react-icons/hi";

import WithdrawModal from './WithdrawModal';
import { useGetVendor } from '../../hook/useVendor';
import { useWithdrawList, useWithdrawStats } from '../../hook/useWithdraws';
import { getPaginationRange } from '../../utils/getPaginationRange';

const statusMenu = [
  { id: 1, status: "Completed" },
  { id: 2, status: "Pending" },
  { id: 3, status: "Rejected" }
];

function Withdrawals() {

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: vendorData } = useGetVendor();
  const { data: stats, isLoading, isError } = useWithdrawStats();
  const { data: withdrawResponse } = useWithdrawList({
    search: debouncedSearch,
    page,
    status
  });

  const withdrawList = withdrawResponse?.data || [];
  const totalPages = withdrawResponse?.totalPages || 1;
  const count = withdrawResponse?.count || 0;

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isActionOpen, setIsActionOpen] = useState(false);

  const cards = [
    {
      label: "Available Balance",
      value: `₹${stats?.availableBalance?.toLocaleString() || '0'}`,
      icon: <HiOutlineCurrencyRupee />,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "Pending Settlement",
      value: `₹${stats?.pendingSettlement?.toLocaleString() || '0'}`,
      icon: <HiOutlineClock />,
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    {
      label: "Withdrawal In-Process", // Naya 4th Card
      value: `₹${stats?.inProcess?.toLocaleString() || '0'}`,
      icon: <HiOutlineRefresh />,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      label: "Total Withdrawn",
      value: `₹${stats?.totalWithdrawn?.toLocaleString() || '0'}`,
      icon: <HiOutlineExternalLink />,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
  ];

  const handlestatus = (status) => {
    setSelectedStatus(status);
    setIsStatusOpen(false);
  };

  if (isLoading) return <p className="p-10 text-center">Loading withdrawal requests...</p>;
  if (isError) return <p className="p-10 text-center text-red-500">Error fetching withdrawal requests!</p>;

  return (
    <div className="space-y-6">

      {/* top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {cards.map((stat, i) => (
          <div
            key={i}
            className={`bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all truncate
            ${stat.label === "Available Balance" ? 'ring-1 ring-transparent hover:ring-blue-100 dark:hover:ring-blue-900 cursor-pointer' : ''}`}
          >
            <div className={`w-11 h-11 md:w-12 md:h-12 shrink-0 rounded-xl 
              ${stat.bg} ${stat.color} flex items-center justify-center text-lg md:text-2xl`}>
              {stat.icon}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-tight truncate">
                {stat.label}
              </p>

              <h4 className="text-lg md:text-xl font-black text-slate-700 dark:text-white truncate">
                {stat.value}
              </h4>
            </div>
          </div>
        ))}
      </div>

      {/* Action Area */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2 py-4">
        <button
          onClick={() => setIsActionOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-pink-200 dark:shadow-none transition-all active:scale-95 cursor-pointer">
          <HiOutlinePlusCircle size={20} />
          Request New Payout
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
            <HiOutlineDocumentDownload size={18} className="text-pink-500" />
            Export CSV
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
            <HiOutlinePrinter size={18} className="text-slate-400" />
            Print
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

        {/* Header & Search/Filter */}
        <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-center md:text-start bg-white dark:bg-slate-800/20">

          <div className='flex gap-2 items-center'>
            <h2 className="text-md md:text-lg font-bold text-slate-800 dark:text-white shrink-0">
              Withdrawal History
            </h2>
            <span className="hidden lg:flex bg-pink-100 text-pink-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Total : {count || 0}
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5 lg:gap-3 w-full lg:w-auto">

            {/* Search Bar */}
            <div className="relative w-full lg:w-80 group">
              <HiOutlineSearch className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Request ID..."
                className="w-full pl-8 md:pl-11 pr-4 py-2 bg-slate-50 border border-pink-50 dark:bg-slate-800 dark:text-white focus:border-pink-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm outline-none transition-all shadow-sm placeholder:text-xs md:placeholder:text-[13px]"
              />
            </div>

            {/* status dropdown */}
            <div className='relative w-full md:w-48 lg:w-auto '>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="w-full md:w-auto text-sm px-4 py-2 rounded-xl border border-pink-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
              >
                <option value="">All Status</option>
                <option value="Processing">Processing</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-800 text-[11px] uppercase tracking-widest text-slate-400 font-bold">
                <th className="px-6 py-4">Request Id</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payout Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">UTR / Ref No.</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {withdrawList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                    {search || status
                      ? 'No withdrawals match your search or filter.'
                      : 'No withdrawal requests found.'
                    }
                  </td>
                </tr>
              ) : (
                withdrawList.map((txn) => (
                  <tr
                    key={txn._id}
                    className="hover:bg-pink-50/30 dark:hover:bg-slate-800/50 transition-colors group">

                    {/* 1. Request ID & Date */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {txn.requestId}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </td>

                    {/* 2. Amount */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-slate-800 dark:text-white">
                        ₹{txn.amount.toLocaleString()}
                      </span>
                    </td>

                    {/* 3. Payout Method */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {txn.method}
                      </span>
                      <p className="text-[10px] text-pink-500 font-medium">
                        {txn.accountDetails?.bankName}
                      </p>
                    </td>

                    {/* 4. Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase border
                                    ${txn.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : txn.status === 'Rejected'
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                        {txn.status}
                      </span>
                    </td>

                    {/* 5. UTR Number */}
                    <td className="px-6 py-4">
                      <span className={`text-xs font-mono
                                    ${txn.utrNumber ? 'text-slate-600 dark:text-slate-300' : 'text-slate-300'}`}>
                        {txn.utrNumber || 'N/A'}
                      </span>
                    </td>

                    {/* 6. Action */}
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-pink-500 shadow-sm border border-transparent hover:border-slate-100 transition-all">
                        <HiOutlineDownload size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
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

      {/* Request Payout Modal */}
      <WithdrawModal
        isOpen={isActionOpen}
        onClose={() => setIsActionOpen(false)}
        vendorData={vendorData}
      />

    </div>
  )
}

export default Withdrawals;