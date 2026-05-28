
import React, { useState } from 'react';
import { HiOutlineStar, HiOutlineChatAlt2 } from "react-icons/hi";
import { HiOutlineCheckCircle } from "react-icons/hi";
import { HiOutlineXCircle } from "react-icons/hi";

import { useSubmitVendorReply, useVendorReviewList, useVendorReviewStats } from '../../hook/useReview';
import { getPaginationRange } from '../../utils/getPaginationRange';
import ReviewReplyModal from './ReviewReplyModal';
import toast from 'react-hot-toast';

function ReviewRating() {

  const { data: stats } = useVendorReviewStats();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useVendorReviewList({
    status: statusFilter,
    page,
    limit
  });

  const reviews = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.count || 0;

  const [activeReviewForReply, setActiveReviewForReply] = useState(null);
  const { mutate: submitReply, isLoading: isReplying } = useSubmitVendorReply();

  const statusStyles = {
    Approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Pending: 'bg-amber-50  text-amber-600  border-amber-100',
    Rejected: 'bg-rose-50   text-rose-600   border-rose-100',
  };

  const statsCards = [
    {
      id: 1,
      label: "Average Rating",
      value: stats?.avgRating || 0,
      subText: "Overall rating",
      icon: <HiOutlineStar size={22} />,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-500/10",
      borderColor: "border-amber-100 dark:border-amber-500/20"
    },
    {
      id: 2,
      label: "Total Reviews",
      value: stats?.totalReviews || 0,
      subText: "All time feedback",
      icon: <HiOutlineChatAlt2 size={22} />,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-500/10",
      borderColor: "border-blue-100 dark:border-blue-500/20"
    },
    {
      id: 3,
      label: "Approved",
      value: stats?.approved || 0,
      subText: "Publicly visible",
      icon: <HiOutlineCheckCircle size={22} />,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
      borderColor: "border-emerald-100 dark:border-emerald-500/20"
    },
    {
      id: 4,
      label: "Rejected",
      value: stats?.rejected || 0,
      subText: "Hidden reviews",
      icon: <HiOutlineXCircle size={22} />,
      color: "text-rose-500",
      bgColor: "bg-rose-50 dark:bg-rose-500/10",
      borderColor: "border-rose-100 dark:border-rose-500/20"
    }
  ];

  // status handler
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleOpenReplyModal = (review) => {
    setActiveReviewForReply(review);
  };

  // reply handler
  const handleSaveReply = (text) => {
    if (!activeReviewForReply?._id) {
      toast.error("Something went wrong. Review not found!");
      return;
    }

    const isEditing = Boolean(activeReviewForReply.vendorReply && activeReviewForReply.vendorReply.trim() !== "");

    submitReply({
      review_id: activeReviewForReply._id,
      replyText: text
    }, {
      onSuccess: (response) => {
        if (isEditing) {
          toast.success("Reply updated successfully!");
        } else {
          toast.success("Reply submitted successfully!");
        }

        setActiveReviewForReply(null);
      },
      onError: (error) => {
        const errorMsg = error?.response?.data?.message || "Failed to save vendor reply.";
        toast.error(errorMsg);
      }
    });
  };

  if (isLoading) return <div className="p-10 text-center font-bold text-pink-500 italic animate-pulse">Loading Reviews...</div>;
  if (isError) return <div className="p-10 text-center text-red-500 font-bold">Failed to load vendor reviews.</div>;

  return (
    <div>

      {/* cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statsCards.map((card) => (
          <div
            key={card.id}
            className="p-5 bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {card.label}
                </p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                  {card.id === 1 ? `${card.value || 0}` : card.value}
                </h3>
              </div>
              <div className={`p-3 rounded-2xl ${card.bgColor} ${card.color} border ${card.borderColor}`}>
                {card.icon}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {card.subText}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">

        {/* Header & Filter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex gap-2 items-center">
              <h2 className="text-md md:text-lg font-bold text-slate-800 dark:text-white shrink-0">
                Customer Feedback
              </h2>
              <span className="hidden lg:flex bg-pink-100 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-bold px-2.5 py-0.5 rounded-full">
                Total : {totalCount}
              </span>
            </div>
            <p className="text-[11px] md:text-xs text-slate-500 mt-1">
              Reviews for your listed products
            </p>
          </div>

          <select
            value={statusFilter}
            // FIX: Uses safe state reset function
            onChange={handleStatusChange}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-pink-500/20 transition-all cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-212">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="pb-4 pl-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[25%]">Customer</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[25%]">Product</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[30%]">Rating & Comment</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[10%] text-center">Status</th>
                <th className="pb-4 pr-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[10%] text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
              {reviews.length > 0 ? reviews.map((review) => {
                return (
                  <tr
                    key={review._id}
                    className="group hover:bg-slate-50/40 dark:hover:bg-slate-900/40 transition-all duration-200">

                    {/* 1. Customer Info */}
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.userId?.profilePhoto || 'https://via.placeholder.com/40'}
                          className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                          alt=""
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                            {review.userId?.name || 'Unknown User'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium truncate italic">
                            {review.userId?.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 2. Product Info */}
                    <td className="py-4">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 line-clamp-1 max-w-45">
                        {review.productId?.prodName}
                      </span>
                      <span className="text-[9px] text-pink-500 font-black uppercase tracking-tighter">
                        In Stock
                      </span>
                    </td>

                    {/* 3. Rating & Comment */}
                    <td className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <HiOutlineStar
                              key={i}
                              size={10}
                              className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-800"}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic pr-4">
                          "{review.review || review.comment}"
                        </p>
                      </div>
                    </td>

                    {/* 4. Status Badge */}
                    <td className="py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border inline-block min-w-22
                       ${statusStyles[review.status] || statusStyles.Pending}`}>
                        {review.status || 'Pending'}
                      </span>
                    </td>

                    {/* 5. Action */}
                    <td className="py-4 pr-4 text-right">
                      <button
                        onClick={() => handleOpenReplyModal(review)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-pink-500 bg-pink-50 dark:bg-pink-500/10 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-500/20 transition-all cursor-pointer"
                      >
                        <HiOutlineChatAlt2 size={14} />
                        {review.vendorReply ? 'EDIT REPLY' : 'REPLY'}
                      </button>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-slate-400 font-medium italic">
                    No reviews found for your products.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* reply modal */}
      <ReviewReplyModal
        isOpen={!!activeReviewForReply}
        review={activeReviewForReply}
        onClose={() => setActiveReviewForReply(null)}
        onSubmit={handleSaveReply}
        isSubmitting={isReplying}
      />
    </div>

  );
}

export default ReviewRating;