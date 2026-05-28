
import React, { useState } from 'react';
import { IoIosStar, IoIosMore } from 'react-icons/io';
import { IoMdClose } from "react-icons/io";
import { HiOutlineX } from "react-icons/hi";
import { HiOutlineExclamation } from "react-icons/hi";
import { HiOutlineTrash } from "react-icons/hi";

import { useAddReview, useDeleteReview, useUserReviews } from '../../hook/useReview';
import { getPaginationRange } from '../../utils/getPaginationRange';

function UserProfileMyReviews() {

    const [page, setPage] = useState(1);
    const { data: reviewResponse, isLoading, isError } = useUserReviews({ page });
    const { mutate: addReview, isPending } = useAddReview();
    const { mutate: deleteReview, isPending: isDeleting } = useDeleteReview();

    const reviews = reviewResponse?.data || [];
    const totalPages = reviewResponse?.totalPages || 0;

    // for edit
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [tempRating, setTempRating] = useState(0);
    const [tempReviewText, setTempReviewText] = useState("");
    const [hoverIndex, setHoverIndex] = useState(0);

    // for dlt
    const [isDeletedOpen, setIsDeletedOpen] = useState(false);

    // ===== EDIT =====
    const handleOpenEditModal = (review) => {
        setSelectedReview(review);
        setTempRating(review.rating);
        setTempReviewText(review.review);
        setIsEditModalOpen(true);
    };

    const handleEditReview = () => {
        addReview({
            prod_id: selectedReview?.productId?._id,
            rating: tempRating,
            review: tempReviewText.trim(),
        }, {
            onSuccess: () => {
                setIsEditModalOpen(false);
            }
        });
    };

    // ===== DELETE =====
    const handleOpenDeleteModal = (review) => {
        setSelectedReview(review);
        setIsDeletedOpen(true);
    };

    const handleDeleteReview = () => {
        const idToDelete = selectedReview?._id;

        if (!idToDelete) {
            toast.error("Review ID not found");
            return;
        }

        deleteReview(idToDelete, {
            onSuccess: () => {
                setIsDeletedOpen(false);
            }
        });
    };

    if (isLoading) return <div className="py-20 text-center text-slate-400">Loading review detail...</div>;
    if (isError) return <div className="py-20 text-center text-red-400">Failed to load review detail</div>;

    return (
        <div>
            <div className="grid grid-cols-1 gap-6">
                {reviews?.length > 0 ? (
                    reviews.map((review, index) => {
                        return (
                            <div
                                key={review._id}
                                className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex flex-col md:flex-row gap-6">

                                    {/* Product Thumbnail */}
                                    <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                                        <img
                                            src={review.productId?.prodImage}
                                            alt={review.productId?.prodName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Review Content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-base mb-1">
                                                    {review.productId?.prodName}
                                                </h4>
                                                <div className="flex items-center gap-1 mb-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <IoIosStar
                                                            key={i}
                                                            className={i < review.rating ? "text-pink-500" : "text-gray-200"}
                                                        />
                                                    ))}
                                                    <span className="text-[10px] text-gray-400 font-bold ml-2 uppercase tracking-tight">
                                                        {review.createdAt &&
                                                            new Date(review.createdAt).toLocaleDateString("en-GB", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="line-clamp-2 text-gray-600 text-sm leading-relaxed italic">
                                            "{review.review}"
                                        </p>

                                        {/* action */}
                                        <div className="mt-4 flex gap-4">
                                            <button
                                                onClick={() => handleOpenEditModal(review)}
                                                className="text-[11px] font-bold text-pink-500 uppercase tracking-wider hover:underline cursor-pointer">
                                                Edit Review
                                            </button>

                                            <button
                                                onClick={() => handleOpenDeleteModal(review)}
                                                className="text-[11px] font-bold text-gray-400 uppercase tracking-wider hover:text-red-500 transition-colors cursor-pointer">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium">You haven't written any reviews yet.</p>
                    </div>
                )}
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

            {/* edit popup */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div
                        className="bg-white w-full max-w-xl rounded-[40px] p-8 shadow-2xl relative animate-in zoom-in duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute right-6 top-6 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                        >
                            <IoMdClose className="text-2xl text-gray-400" />
                        </button>

                        <h2 className="text-2xl font-black text-gray-900 mb-2">
                            Edit Review
                        </h2>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-6">
                            {selectedReview?.productId?.prodName}
                        </p>

                        {/* Stars */}
                        <div className="flex gap-2 text-4xl text-pink-500 mb-6">
                            {[...Array(5)].map((_, i) => {
                                const index = i + 1;
                                return (
                                    <IoIosStar
                                        key={i}
                                        className={index <= (hoverIndex || tempRating) ? "cursor-pointer" : "text-gray-200 cursor-pointer"}
                                        onMouseEnter={() => setHoverIndex(index)}
                                        onMouseLeave={() => setHoverIndex(0)}
                                        onClick={() => setTempRating(index)}
                                    />
                                );
                            })}
                        </div>

                        {/* Textarea */}
                        <textarea
                            value={tempReviewText}
                            onChange={(e) => setTempReviewText(e.target.value)}
                            className="w-full h-36 p-5 bg-gray-50 border-2 border-gray-100 rounded-3xl outline-none focus:border-pink-500 transition-all resize-none text-gray-700 text-sm mb-6"
                            placeholder="Write your experience..."
                        />

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-gray-200 cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleEditReview}
                                disabled={isPending}
                                className="flex-1 py-4 bg-pink-500 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-pink-100 hover:bg-pink-600 cursor-pointer"
                            >
                                {isPending ? "Saving.." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            Remove Review
                        </h3>
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                            Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-white">"{"this review"}"</span>?
                            This action cannot be undone.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => setIsDeletedOpen(false)}
                            className="w-full justify-center rounded-2xl bg-white px-3 py-3.5 text-sm font-bold text-slate-600 border border-slate-100 hover:bg-slate-50 transition-all sm:w-1/2 active:scale-95 cursor-pointer"
                        >
                            No, Keep it
                        </button>

                        <button
                            type="button"
                            onClick={handleDeleteReview}
                            disabled={isDeleting}
                            className="w-full justify-center rounded-2xl bg-linear-to-br from-red-500 to-red-600 px-3 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-100 hover:from-red-600 hover:to-red-700 transition-all sm:w-1/2 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
}

export default UserProfileMyReviews;