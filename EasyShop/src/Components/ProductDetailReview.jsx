
import React, { useState } from 'react'
import { IoIosStar } from "react-icons/io";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

import { useProductReviews } from '../hook/useReview';

function ProductDetailReview({ prodId }) {

    const { data: productReviews = [], isLoading, isError } = useProductReviews(prodId);
    const [reviewOpen, setReviewOpen] = useState(false);

    const totalReviews = productReviews.length;
    const averageRating = totalReviews > 0 ? productReviews[0]?.productId?.averageRating : 0;

    if (isLoading) return <div className="p-20 text-center">Loading reviews...</div>;
    if (isError) return <div className="p-20 text-center">Reviews Not Found!</div>;

    return (
        <div>
            <div className="max-w-6xl mx-auto p-4 mt-5 md:mt-10">
                <h2 className="text-xl md:text-2xl font-bold mb-8">Customer Reviews</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Left Side: Summary */}
                    <div className="lg:col-span-1 h-fit lg:sticky lg:top-10">
                        <div className="flex items-center lg:items-start gap-6 mb-6">
                            <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-none">
                                {averageRating}
                            </h1>

                            {/* stars */}
                            <div>
                                <div className="flex text-xl md:text-2xl mb-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <IoIosStar key={star} className={star <= averageRating ? "text-yellow-400" : "text-gray-200"} />
                                    ))}
                                </div>
                                <p className="text-gray-500 text-sm font-semibold tracking-wide">
                                    Based on {totalReviews} reviews
                                </p>
                            </div>
                        </div>

                        {/* Progress Bars */}
                        <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                            {totalReviews > 0 ? (
                                [5, 4, 3, 2, 1].map((num) => (
                                    <div key={num} className="flex items-center gap-4 mb-3 last:mb-0">
                                        <span className="text-sm font-bold w-4 text-gray-600">{num}</span>
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-pink-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${num === 5 ? '80%' : '5%'}` }}
                                            ></div>
                                        </div>
                                        <span className="text-[12px] font-medium text-gray-400 w-8">
                                            {num === 5 ? '80%' : '5%'}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-400 text-sm italic font-medium">No approved reviews yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Reviews List */}
                    <div className="lg:col-span-2 space-y-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Customer Stories
                        </h3>

                        {totalReviews > 0 ? (
                            <div className="space-y-6">
                                {productReviews.slice(0, reviewOpen ? undefined : 2).map((review) => (
                                    <div key={review._id} className="border-b border-gray-100 pb-8 last:border-0 hover:bg-gray-50/30 p-2 rounded-xl transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">

                                                <div className="w-12 h-12 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center font-bold text-lg">
                                                    {review.userId?.name?.charAt(0) || 'U'}
                                                </div>

                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-base">
                                                        {review.userId?.name}
                                                    </h4>

                                                    <div className="flex text-yellow-400 text-[14px]">
                                                        {[...Array(5)].map((_, i) => (
                                                            <IoIosStar key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-200"} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <span className="text-[11px] md:text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                {new Date(review.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed italic pl-1 md:pl-15">"{review.review}"</p>
                                    </div>
                                ))}

                                {totalReviews > 2 && (
                                    <div className="flex justify-center my-6">
                                        <button
                                            onClick={() => setReviewOpen(!reviewOpen)}
                                            className="px-6 py-2 border border-pink-500 text-pink-500 font-bold rounded-full hover:bg-pink-500 hover:text-white transition-all uppercase text-xs"
                                        >
                                            {reviewOpen ? "View Less" : "View More"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Empty State Design */
                            <div className="p-10 border border-dashed border-gray-200 rounded-3xl flex items-center justify-center bg-gray-50/30">
                                <p className="text-gray-400 font-medium">
                                    Be the first to share your experience!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetailReview;