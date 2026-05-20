
import React, { useState } from 'react';
import { IoIosStar } from "react-icons/io";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import confetti from 'canvas-confetti';
import { useNavigate, useParams } from 'react-router-dom';

import { useOrderDetail } from '../hook/useOrders';
import { useAddReview } from '../hook/useReview';
import toast from 'react-hot-toast';

function ReviewRating() {

    const navigate = useNavigate();
    const { orderId } = useParams();

    const { data: orderDetail, isLoading, isError } = useOrderDetail(orderId);
    const { mutate: addReview, isPending } = useAddReview();

    const [hoverIndex, setHoverIndex] = useState(0);
    const [clickIndex, setClickIndex] = useState(0);
    const [reviewPopup, setReviewPopup] = useState(false);

    const [reviewText, setReviewText] = useState("");

    const handleSubmitReview = () => {

        const prod_id = orderDetail?.items[0]?.productId?._id;

        if (!prod_id) {
            toast.error("Product not found");
            return;
        }

        if (clickIndex === 0) {
            toast.error("Please select a rating");
            return;
        }

        if (!reviewText.trim()) {
            toast.error("Please enter a product review");
            return;
        }

        addReview({
            prod_id,
            rating: clickIndex,
            review: reviewText.trim(),
        }, {
            onSuccess: () => {
                setReviewPopup(true);
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    zIndex: 999,
                    colors: ['#ec4899', '#f472b6', '#db2777']
                });
            }
        });
    };

    if (isLoading) return <div className="py-20 text-center text-slate-400">Loading order detail...</div>;
    if (isError) return <div className="py-20 text-center text-red-400">Failed to load order detail</div>;

    return (
        <section className='w-full min-h-[70vh] md:pb-6 px-4 lg:px-6'>

            {/* top section */}
            <div className='max-w-6xl mx-auto'>
                <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-white rounded-xl md:rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">

                    {/* heading */}
                    <div className="mb-4 md:mb-0 text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                            Ratings & <span className="text-pink-500">Reviews</span>
                        </h1>
                        <p className="text-xs md:text-sm mt-1 text-gray-400 font-medium">
                            Share your experience with this product
                        </p>
                    </div>

                    {/* Top - product detail section */}
                    {orderDetail?.items?.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 bg-gray-50/50 p-2 md:p-3 rounded-xl md:rounded-3xl border border-dashed border-gray-200 w-full md:w-auto justify-center md:justify-end">
                            <div className="text-right">
                                <h2 className="text-[12px] text-pink-500 font-medium md:font-extrabold uppercase tracking-tight">
                                    {item.productId?.prodName}
                                </h2>
                                <p className="text-[12px] md:text-[14px] text-gray-500">
                                    Qty: {item.quantity} <span className="mx-1 text-gray-300">•</span>
                                    <span className="font-black text-gray-800">
                                        ₹{item.price}
                                    </span>
                                </p>
                            </div>

                            {/* Product Image */}
                            <div className='w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg shadow-gray-100 shrink-0'>
                                <img
                                    src={
                                        item.productId?.attributes?.Color?.images?.[item.selectedColor]?.[0]
                                        || item.productId?.prodImage
                                    }
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    ))}

                </div>
            </div>

            {/* below section */}
            <div className='max-w-6xl mx-auto my-10 flex flex-wrap md:flex-nowrap gap-10'>

                {/* Left Section */}
                <div className="order-2 md:order-0 w-full md:w-[32%] h-fit bg-white p-4 md:p-6 rounded-xl md:rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <div className="pb-4 border-b border-gray-100">
                        <h2 className="text-[16px] md:text-[18px] font-black text-gray-900 tracking-tight uppercase">
                            Review <span className="text-pink-500">Guide</span>
                        </h2>
                    </div>

                    {/* Point 1 */}
                    <div className="py-4 md:py-6 border-b border-gray-50 group">
                        <h3 className="text-[16px] font-bold text-gray-800 group-hover:text-pink-500 transition-colors">
                            Have you used it?
                        </h3>
                        <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                            Your review should be based on your personal experience with the product's quality and usage.
                        </p>
                    </div>

                    {/* Point 2 */}
                    <div className="py-4 md:py-6 border-b border-gray-50 group">
                        <h3 className="text-[16px] font-bold text-gray-800 group-hover:text-pink-500 transition-colors">
                            Why it matters?
                        </h3>
                        <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                            Your feedback helps other shoppers make the right choice. Be a hero for the community!
                        </p>
                    </div>

                    {/* Point 3 */}
                    <div className="py-4 md:py-6 group">
                        <h3 className="text-[16px] font-bold text-gray-800 group-hover:text-pink-500 transition-colors">
                            Be Honest & Factual
                        </h3>
                        <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                            Stick to facts and share your honest opinion. Facing issues? Contact our <span className="text-pink-500 font-semibold cursor-pointer underline">Help Centre</span> directly.
                        </p>
                    </div>
                </div>

                {/* right Section */}
                <div className='order-1 md:order-0 w-full md:w-[68%] h-fit bg-white p-4 md:p-6 rounded-xl md:rounded-[2.5rem] border border-gray-100 shadow-sm'>

                    {/* Rating Section */}
                    <div className="py-4 border-b border-gray-100">
                        <h1 className="text-[16px] md:text-[20px] font-semibold text-gray-900 tracking-tight">
                            Rate this Product
                        </h1>

                        <div className="py-4 text-[25px] md:text-[45px] flex flex-wrap items-center gap-1 md:gap-3  text-pink-500">
                            <div className="flex gap-1 md:gap-3">
                                {[...Array(5)].map((_, i) => {
                                    const index = i + 1;
                                    return (
                                        <IoIosStar
                                            key={i}
                                            className={index <= (hoverIndex || clickIndex)
                                                ? "cursor-pointer transition-all scale-100 hover:scale-110"
                                                : "cursor-pointer text-gray-200 transition-all"
                                            }
                                            onMouseEnter={() => setHoverIndex(index)}
                                            onMouseLeave={() => setHoverIndex(0)}
                                            onClick={() => setClickIndex(index)}
                                        />
                                    )
                                })}
                            </div>

                            {/* Dynamic Label with better spacing */}
                            <p className="text-[14px] md:text-[16px] font-bold ml-2 md:ml-4 whitespace-nowrap">
                                {clickIndex === 1 ? <span className="text-red-500">Very Bad 😞</span>
                                    : clickIndex === 2 ? <span className="text-orange-500">Bad 😐</span>
                                        : clickIndex === 3 ? <span className="text-yellow-500">Good 🙂</span>
                                            : clickIndex === 4 ? <span className="text-green-500">Very Good 😊</span>
                                                : clickIndex === 5 ? <span className="text-green-600">Excellent 😍</span>
                                                    : <span className="text-gray-300">
                                                        Select Rating
                                                    </span>}
                            </p>
                        </div>
                    </div>

                    {/* Review Textarea */}
                    <div className="py-6">

                        <h1 className="text-[16px] md:text-[20px] font-semibold text-gray-900 tracking-tight">
                            Review this product
                        </h1>

                        <div className="mt-4">
                            <textarea
                                name='review'
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Description..."
                                className="text-[13px] md:text-[15px] w-full h-36 md:h-45 p-3 md:p-5 bg-gray-50 border-2 border-gray-200 outline-none resize-none rounded-3xl focus:border focus:border-pink-500 focus:bg-white transition-all text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="w-full mt-6 md:flex md:justify-end">
                        <button
                            onClick={handleSubmitReview}
                            disabled={isPending}
                            className="w-full md:w-auto px-10 py-4 bg-pink-500 text-white rounded-2xl font-bold text-[16px] md:text-[18px] hover:bg-pink-600 shadow-lg shadow-pink-100 active:scale-95 transition-all duration-150 uppercase tracking-wider cursor-pointer"
                        >
                            {isPending ? "Submitting..." : "Submit Review"}
                        </button>
                    </div>
                </div>
            </div>

            {/* review submit popup */}
            {reviewPopup && (
                <div
                    //when click outside pop-up close
                    id='popup-overlay'
                    onClick={(e) => {
                        if (e.target.id === "popup-overlay") setReviewPopup(false);
                    }}
                    className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-md z-200 px-4 transition-all duration-500">

                    <div className={`bg-white p-6 md:p-10 rounded-4xl md:rounded-[3rem] shadow-2xl text-center w-full max-w-[90%] md:max-w-100 border border-gray-100 transition-all duration-500 transform scale-100 animate-in zoom-in-95`}>

                        <div className="mb-4 md:mb-6 flex justify-center">
                            <div className="relative">

                                <div className="relative w-16 h-16 md:w-20 md:h-20 bg-linear-to-tr from-pink-500 to-pink-400 text-white rounded-full flex items-center justify-center text-4xl md:text-5xl shadow-lg shadow-pink-200">
                                    <IoMdCheckmarkCircleOutline />
                                </div>
                            </div>
                        </div>

                        {/* Text Content */}
                        <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                            Thank you <span className="text-pink-500 text-2xl md:text-3xl">!</span>
                        </h1>
                        <p className="text-sm md:text-base text-gray-500 font-medium mt-2 md:mt-3 px-2 md:px-4">
                            Your valuable review has been saved successfully. It helps others shop better!
                        </p>

                        {/* Done/Close Button */}
                        <button
                            onClick={() => {
                                setReviewPopup(false);
                                navigate('/my_orders');
                            }}
                            className="mt-6 md:mt-8 w-full py-3.5 md:py-4 bg-gray-900 text-white rounded-xl md:rounded-2xl font-bold text-sm md:text-base hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200 cursor-pointer"
                        >
                            DONE
                        </button>
                    </div>
                </div>
            )}

        </section>
    )
}

export default ReviewRating;