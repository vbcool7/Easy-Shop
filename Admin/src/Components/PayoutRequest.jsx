
import React from 'react';
import { useState } from 'react';
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { TiTick } from "react-icons/ti";
import toast from 'react-hot-toast';

import { useToggleWithdrawStatus, useWithdrawReqList } from '../hooks/useWithdraws';
import { getPaginationRange } from '../utils/getPaginationRange';
import { useTranslation } from 'react-i18next';

const statusMenu = [
  { id: 1, status: "Processing" },
  { id: 2, status: "Approved" },
  { id: 3, status: "Rejected" }
];

function PayoutRequest() {

  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setIsSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    status: "",
    utrNumber: "",
    adminNote: ""
  });

  const { data, isLoading, isError } = useWithdrawReqList({ status: selectedStatus?.status || '', page });
  const { mutate: updateStatus, isPending: isUpdating } = useToggleWithdrawStatus();

  const withdrawReqList = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.count || 0;

  // top filter
  const handlestatus = (status) => {
    setSelectedStatus(status);
    setIsStatusOpen(false);
    setPage(1);
  };

  // update status
  const handleSubmit = () => {
    if (!formData.utrNumber) {
      return toast.error("UTR No is required");
    }

    updateStatus({
      withdraw_id: selectedId,
      formData: {
        status: "Approved",
        utrNumber: formData.utrNumber,
        adminNote: formData.adminNote
      }
    }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ status: "", utrNumber: "", adminNote: "" });
      }
    });
  };

  // handle reject
  const handleReject = (id) => {
    const note = prompt("Reason for rejection? (Optional)");

    updateStatus({
      withdraw_id: id,
      formData: {
        status: "Rejected",
        adminNote: note || "Rejected by Admin",
        utrNo: "" // Reject mein UTR nahi chahiye
      },
      onSuccess: () => {
        toast.error("Request Rejected and Balance Refunded");
      }
    });
  };

  if (isLoading) return <p className="p-10 text-center animate-pulse">{t('payoutRequests.loading')}</p>;
  if (isError) return <p className="p-10 text-center text-red-500">{t('payoutRequests.error')}</p>;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

      {/* heading */}
      <div className="p-4 md:p-6 border-b border-pink-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

        <div>
          <div className='flex items-center gap-2.5'>
            <h2 className="text-md md:text-lg font-bold text-slate-800 dark:text-white shrink-0">
              {t('payoutRequests.title')}
            </h2>
            <span className="bg-pink-100 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 px-2.5 py-0.5 md:py-1 rounded-full text-[11px] md:text-xs font-bold">
              {t('payoutRequests.totalBadge')} {totalCount}
            </span>
          </div>
          <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('payoutRequests.description')}
          </p>
        </div>

        {/* dropdown */}
        <div className='relative w-full md:w-48 lg:w-55'>

          <button
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className={`w-full bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl md:rounded-2xl flex justify-between items-center transition-all border cursor-pointer
                ${isStatusOpen ? 'border-pink-400 ring-2 ring-pink-50' : 'border-transparent hover:border-pink-200'}`}
          >
            <span className={`${selectedStatus ? 'text-slate-800 dark:text-white font-medium' : 'text-slate-400'} text-[11px] md:text-[14px] truncate mr-3`}>
              {selectedStatus ? selectedStatus.status : t('payoutRequests.allStatus')}
            </span>

            <div className="shrink-0">
              {isStatusOpen ? <IoIosArrowUp className='text-pink-500' /> : <IoIosArrowDown className='text-slate-400' />}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isStatusOpen && (
            <div className='absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 rounded-b-xl shadow-xl border border-pink-50 dark:border-slate-700 py-2 overflow-hidden animate-in fade-in zoom-in duration-200'>

              <div className='max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700'>
                <div
                  onClick={() => { setSelectedStatus(null); setIsStatusOpen(false); setPage(1); }}
                  className='px-4 py-1.5 hover:bg-pink-50 cursor-pointer text-slate-400 font-medium transition-colors text-[11px] md:text-[13px] border-b border-slate-50'
                >
                  {t('payoutRequests.allStatus')}
                </div>
                {statusMenu.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handlestatus(item)}
                    className='px-4 py-1.5 hover:bg-pink-50 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-300 hover:text-pink-600 font-medium transition-colors text-[11px] md:text-[13px] border-b border-slate-50 dark:border-slate-700 last:border-none'
                  >
                    {item.status}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">

          <thead className="bg-slate-50/50 dark:bg-slate-800/50">
            <tr className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              <th className="px-6 py-4 ">{t('payoutRequests.colRequestId')}</th>
              <th className="px-6 py-4 ">{t('payoutRequests.colVendorInfo')}</th>
              <th className="px-6 py-4 ">{t('payoutRequests.colAvailableBalance')}</th>
              <th className="px-6 py-4 ">{t('payoutRequests.colAmount')}</th>
              <th className="px-6 py-4 text-center">{t('payoutRequests.colBankDetails')}</th>
              <th className="px-6 py-4 ">{t('payoutRequests.colDate')}</th>
              <th className="px-6 py-4 ">{t('payoutRequests.colUtr')}</th>
              <th className="px-6 py-4 ">{t('payoutRequests.colAdminNote')}</th>
              <th className="px-6 py-4 ">{t('payoutRequests.colStatus')}</th>
              <th className="px-6 py-4 ">{t('payoutRequests.colAction')}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {withdrawReqList.length > 0 ? withdrawReqList.map((txn) => {
              return (
                <tr
                  key={txn._id}
                  className="hover:bg-pink-50/20 transition-all group whitespace-nowrap">

                  {/* Request ID */}
                  <td className="px-6 py-5 text-[12px] font-bold text-slate-700">
                    {txn.requestId}
                  </td>

                  {/* Vendor Info */}
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-slate-800">
                      {txn.vendorId?.name || "---"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {txn.vendorId?.email}
                    </div>
                  </td>

                  {/* Available Balance (Optional - for Admin reference) */}
                  <td className="px-6 py-5 text-sm font-bold text-slate-700">
                    ₹{txn.vendorId?.availableBalance?.toLocaleString() || '0'}
                  </td>

                  {/* Requested Amount */}
                  <td className="px-6 py-5">
                    <div className="text-sm font-black text-slate-800">
                      ₹{txn.amount?.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-blue-500 font-bold uppercase">
                      {txn.method}
                    </div>
                  </td>

                  {/* Bank Details */}
                  <td className="px-6 py-5 text-[11px] text-slate-600">
                    <p className="font-bold">{txn.accountDetails?.bankName}</p>
                    <p>A/C: {txn.accountDetails?.accountNo}</p>
                    <p>IFSC: {txn.accountDetails?.ifsc}</p>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-5 text-[12px] text-slate-500">
                    <p className="text-[10px] text-slate-400">
                      {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </td>

                  {/* UTR No. */}
                  <td className="px-6 py-5 text-sm text-slate-600">
                    {txn.utrNumber || '---'}
                  </td>

                  {/* Admin Note */}
                  <td className="px-6 py-5 text-[11px] text-slate-500 max-w-37 truncate">
                    {txn.adminNote || "---"}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold 
                  ${txn.status === 'Approved' ? 'bg-green-100 text-green-600' :
                        txn.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                      {txn.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-5">
                    {txn.status === 'Processing' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setIsSelectedId(txn._id);
                            setIsModalOpen(true);
                          }}
                          className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-pink-600 transition-colors">
                          {t('payoutRequests.settle')}
                        </button>

                        <button
                          onClick={() => handleReject(txn._id)}
                          className="border border-slate-200 text-slate-400 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-red-50 hover:text-red-500 transition-colors">
                          {t('payoutRequests.reject')}
                        </button>
                      </div>
                    ) : (
                      <div className={`flex items-center gap-1.5 font-bold text-[10px] ${txn.status === 'Approved' ? 'text-pink-600' : 'text-red-500'
                        }`}>
                        {txn.status === 'Approved' ? (
                          <><span className="text-sm">✓</span> {t('payoutRequests.settled')}</>
                        ) : (
                          <><span className="text-sm">✖</span> {t('payoutRequests.rejected')}</>
                        )}
                      </div>
                    )}

                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan="10" className="text-center py-10 text-slate-400 text-sm">
                  {t('payoutRequests.emptySearch')}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4 px-6 border-t border-pink-50 dark:border-slate-800">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-pink-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {t('payoutRequests.prev')}
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
              {t('payoutRequests.next')}
            </button>
          </div>
        )}
      </div>

      {/* for approved - modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 overflow-hidden">

            <div className="bg-linear-to-r from-pink-50 to-pink-100 p-6 border-b border-slate-50">
              <h3 className="text-xl font-bold text-slate-800">
                {t('payoutRequests.modalTitle')}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {t('payoutRequests.modalSubtitle')}
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* UTR Number Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {t('payoutRequests.utrLabel')} <span className="text-pink-500">{t('payoutRequests.utrRequired')}</span>
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:border-pink-400 focus:ring-4 focus:ring-pink-50 outline-none transition-all placeholder:text-slate-400 text-slate-700"
                  placeholder={t('payoutRequests.utrPlaceholder')}
                  value={formData.utrNumber}
                  onChange={(e) => setFormData({ ...formData, utrNumber: e.target.value })}
                  required
                />
              </div>

              {/* Admin Note */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {t('payoutRequests.adminNoteLabel')}
                </label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 h-28 outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-50 transition-all resize-none placeholder:text-slate-400 text-slate-700"
                  placeholder={t('payoutRequests.adminNotePlaceholder')}
                  value={formData.adminNote}
                  onChange={(e) => setFormData({ ...formData, adminNote: e.target.value })}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="bg-slate-50 p-4 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
              >
                {t('payoutRequests.modalCancel')}
              </button>

              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-[#db2777] hover:bg-[#be185d] text-white text-sm font-bold rounded-xl shadow-lg shadow-pink-200 transition-all active:scale-95"
              >
                {t('payoutRequests.modalSubmit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PayoutRequest;