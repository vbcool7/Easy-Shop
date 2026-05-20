
import React, { useState } from 'react';
import { HiOutlineStar, HiOutlineTrash, HiOutlineCheckCircle, HiOutlineClock } from "react-icons/hi";
import { LiaTrashSolid } from "react-icons/lia";
import { HiOutlineExclamation, HiOutlineX } from 'react-icons/hi';

import { useDeleteReview, useReviewList, useUpdateReviewStatus } from '../hooks/useReviews';

const ReviewTable = () => {

    const [statusFilter, setStatusFilter] = useState('');
    const { data, isLoading, isError } = useReviewList(statusFilter);

    const { mutate: toggleStatus, isPending: isUpdating } = useUpdateReviewStatus();
    const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();

    const [isDeletedOpen, setIsDeletedOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    const reviews = data?.data || [];

    // status toggle
    const statusStyles = {
        Approved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        Pending: 'bg-amber-50  text-amber-600  border-amber-200',
        Rejected: 'bg-rose-50   text-rose-600   border-rose-200',
    };

    // delete
    const handleDeleteClick = (review) => {
        setSelectedReview(review);
        setIsDeletedOpen(true);
    }

    const handleDeleteReview = () => {
        if (!selectedReview?._id) return;

        deleteReview(selectedReview._id, {
            onSuccess: () => {
                setIsDeletedOpen(false);
                setSelectedReview(null);
            }
        });
    }

    if (isLoading) return <div className="p-10 text-center font-bold text-pink-500">Loading Reviews...</div>;
    if (isError) return <div className="p-10 text-center text-red-500">Error loading reviews.</div>;

    return (
        <div className="p-6 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">

            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white">Product Reviews</h2>
                    <p className="text-xs text-slate-400 font-medium">Manage and moderate customer feedback</p>
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-pink-500/20"
                >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse min-w-225">

                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                            <th className="pb-4 pl-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-55">User / Customer</th>
                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-50">Product & Vendor</th>
                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-62.5">Rating & Comment</th>
                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-30 text-center">Status</th>
                            <th className="pb-4 pr-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-20 text-right">Action</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
                        {reviews.length > 0 ? reviews.map((review) => (
                            <tr 
                            key={review._id} 
                            className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-all duration-200">

                                {/* 1. Customer Info */}
                                <td className="py-4 pl-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={review.userId?.profilePhoto || 'https://via.placeholder.com/40'}
                                            className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                                            alt=""
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                                                {review.userId?.name}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium truncate">
                                                {review.userId?.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* 2. Product & Vendor Info */}
                                <td className="py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-45">
                                            {review.productId?.prodName}
                                        </span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <img
                                                src={review.productId?.vendorId?.profilePhoto || 'https://via.placeholder.com/20'}
                                                className="w-3.5 h-3.5 rounded-full"
                                                alt=""
                                            />
                                            <span className="text-[10px] text-pink-500 font-black uppercase tracking-tight">
                                                {review.productId?.vendorId?.name}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                {/* 3. Rating & Comment */}
                                <td className="py-4">
                                    <div className="flex flex-col gap-0.5 pr-4">
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <HiOutlineStar
                                                    key={i}
                                                    size={10}
                                                    className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic max-w-57.5">
                                            "{review.review || review.comment}"
                                        </p>
                                    </div>
                                </td>

                                {/* 4. Status Badge */}
                                <td className="py-4 text-center">
                                    <select
                                        value={review.status || 'Pending'}
                                        disabled={isUpdating}
                                        onChange={(e) => toggleStatus({ review_id: review._id, status: e.target.value })}
                                        className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border cursor-pointer outline-none transition-all appearance-none text-center min-w-21.25
                                         ${statusStyles[review.status] || statusStyles.pending}`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </td>

                                {/* 5. Actions */}
                                <td className="py-4 pr-4 text-right">
                                    <button
                                        disabled={isLoading}
                                        onClick={() => handleDeleteClick(review)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
                                        <HiOutlineTrash size={16} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="py-20 text-center text-slate-400 font-medium italic">
                                    No reviews matching your filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* delete popup */}
            <div
                className={`fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-100 px-4 transition-all duration-300 
                    ${isDeletedOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
            >
                <div
                    onClick={() => setIsDeletedOpen(false)}
                    className="absolute inset-0"
                ></div>

                <div
                    onClick={(e) => e.stopPropagation()}
                    className={`relative transform transition-all duration-300 rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-2xl w-full max-w-md border border-pink-50 dark:border-slate-800
                        ${isDeletedOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
                >
                    <button
                        onClick={() => setIsDeletedOpen(false)}
                        className="absolute top-6 right-6 text-slate-400 hover:text-pink-500 transition-colors"
                    >
                        <HiOutlineX size={20} />
                    </button>

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 mb-6">
                        <HiOutlineExclamation className="h-8 w-8 text-red-500" />
                    </div>

                    <div className="text-center">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                            Remove Review/Rating
                        </h3>
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                            Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-white">" {"this review"}"</span>?
                            This action cannot be undone.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => setIsDeletedOpen(false)}
                            className="w-full justify-center rounded-2xl bg-white px-3 py-3.5 text-sm font-bold text-slate-600 border border-slate-100 hover:bg-slate-50 transition-all sm:w-1/2 active:scale-95"
                        >
                            No, Keep it
                        </button>

                        <button
                            type="button"
                            onClick={handleDeleteReview}
                            disabled={isDeleting}
                            className="w-full justify-center rounded-2xl bg-linear-to-br from-red-500 to-red-600 px-3 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-100 hover:from-red-600 hover:to-red-700 transition-all sm:w-1/2 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? (
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                            ) : (
                                <HiOutlineTrash size={18} />
                            )}
                            {isDeleting ? "Deleting..." : "Yes, Delete"}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ReviewTable;