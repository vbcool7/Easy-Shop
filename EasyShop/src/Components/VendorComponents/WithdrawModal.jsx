
import React, { useState } from 'react';
import { HiOutlineLibrary } from "react-icons/hi";
import toast from 'react-hot-toast';

import { useCreateWithdrawReq } from '../../hook/useWithdraws';
import { useTranslation } from 'react-i18next';

const WithdrawModal = ({ isOpen, onClose, vendorData }) => {
    const { t } = useTranslation();
    const { mutate: createWithdrawReq, isPending: isUpdating } = useCreateWithdrawReq();

    const [formData, setFormData] = useState({
        amount: '',
        method: '',
    });

    // i/p handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // handle create
    const handleCreate = () => {
        if (!formData.amount || formData.amount <= 0) {
            return toast.error("Please enter a valid amount");
        }

        if (formData.amount > vendorData?.availableBalance) {
            return toast.error("Insufficient balance!");
        }

        if (formData.amount < 500) {
            return toast.error("Minimum withdrawal is ₹500");
        }

        createWithdrawReq(
            {
                amount: Number(formData.amount),
                method: 'Bank Transfer'
            },
            {
                onSuccess: () => {
                    toast.success("Withdrawal request sent!");
                    setFormData({ amount: '', method: '' });
                    onClose();
                },
                onError: (err) => {
                    toast.error(err.response?.data?.message || "Failed to create request");
                }
            }
        );
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">

            {/* Click Outside to Close */}
            <div className="fixed inset-0"
                onClick={onClose}>
            </div>

            <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-pink-50 dark:border-slate-800">

                {/* Modal Header */}
                <div className="p-4 md:p-6 bg-pink-50 dark:bg-pink-500/10 border-b border-pink-100 dark:border-pink-500/20 text-center">
                    <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white">
                        {t('withdrawModal.title')}
                    </h3>
                    <p className="text-[11px] md:text-xs text-pink-500 mt-1 uppercase font-bold tracking-widest">
                        {t('withdrawModal.availableBalance', { balance: vendorData?.availableBalance?.toLocaleString() })}
                    </p>
                </div>

                {/* Modal Body */}
                <div className="p-4 md:p-8 space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                            {t('withdrawModal.labelAmount')}
                        </label>

                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl md:text-2xl font-black text-slate-300">₹</span>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                placeholder="0"
                                className="w-full pl-10 pr-4 py-2 md:py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-pink-500 rounded-2xl text-xl md:text-2xl font-black outline-none transition-all"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-bold italic">
                            {t('withdrawModal.minWithdrawal')}
                        </p>
                    </div>

                    {/* Bank Info Summary */}
                    <div className="p-2 md:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                            <HiOutlineLibrary className="text-pink-500 text-xl" />
                        </div>

                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                                {t('withdrawModal.transferTo')}
                            </p>
                            <p className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200">
                                {vendorData?.bank} ({vendorData?.accNumber?.slice(-4).padStart(8, '●')})
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                                IFSC: {vendorData?.ifsc}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-col gap-3'>
                        <button
                            onClick={handleCreate}
                            disabled={isUpdating}
                            className={`w-full py-2.5 md:py-4 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 cursor-pointer
                            ${isUpdating ? 'bg-slate-400 cursor-not-allowed' : 'bg-pink-500 hover:bg-pink-600 text-white shadow-pink-200'}`}
                        >
                            {isUpdating ? t('withdrawModal.btnProcessing') : t('withdrawModal.btnSubmit')}
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors"
                        >
                            {t('withdrawModal.btnCancel')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WithdrawModal;