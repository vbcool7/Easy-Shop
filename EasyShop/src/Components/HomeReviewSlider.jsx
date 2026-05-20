
import React from 'react'
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { SiInstagram } from "react-icons/si";
import { FaSquareFacebook } from "react-icons/fa6";
import { BsWhatsapp } from "react-icons/bs";
import { FaRegUser } from "react-icons/fa6";
import { FaQuoteRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import { useApprovedReviews } from '../hook/useReview';

function HomeReviewSlider() {

    const { data: reviews = [], isLoading, isError } = useApprovedReviews();

    const SOCIAL_ICONS = [
        { icon: <SiInstagram />, name: "Instagram" },
        { icon: <FaSquareFacebook />, name: "Facebook" },
        { icon: <BsWhatsapp />, name: "WhatsApp" }
    ];

    // rating
    const renderStars = (rating) => {
        const stars = [];
        const floorRating = Math.floor(rating || 5);
        for (let i = 0; i < floorRating; i++) {
            stars.push(<FaStar key={`full-${i}`} className="text-pink-500 text-[16px]" />);
        }
        if (rating % 1 !== 0) {
            stars.push(<FaStarHalfAlt key="half" className="text-pink-500 text-[16px]" />);
        }
        return stars;
    };

    if (isLoading) return <div className="p-20 text-center">Loading reviews...</div>;
    if (isError) return <div className="p-20 text-center">Reviews Not Found!</div>;

    if (reviews.length === 0) return null;

    return (
        <section className="w-full bg-pink-100/30 py-8 md:py-16 px-4 lg:px-6">
            <div className="max-w-6xl mx-auto">

                {/* heading */}
                <div className="flex flex-col items-center mb-8 md:mb-12">
                    <h2 className="text-2xl md:text-4xl text-center font-bold text-gray-800 tracking-tight">
                        What Our Happy Customers Say
                    </h2>

                    <div className="w-20 h-1 md:h-1.5 bg-pink-500 rounded-full mt-2 md:mt-3"></div>

                    <p className="text-gray-500 mt-4 text-[12px] text-center md:text-sm uppercase tracking-widest">
                        Real stories from people who found their perfect style with us
                    </p>
                </div>

                {/* Slider */}
                <Swiper
                    modules={[Autoplay]}
                    slidesPerView={4}
                    spaceBetween={30}
                    loop={reviews.length > 4}
                    autoplay={{ delay: 3000 }}
                    breakpoints={{
                        0: { slidesPerView: 1 },
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                        1280: { slidesPerView: 4 },
                    }}
                    className="py-10 px-5"
                >
                    {reviews.map((item, index) => {

                        const name = item.userId?.name || "Verified Customer";
                        const reviewText = item.review ;
                        const avatarUrl = item.userId?.profilePhoto;
                        const ratingValue = item.rating || 5;

                        const socialBadge = SOCIAL_ICONS[index % SOCIAL_ICONS.length];

                        return (
                            <SwiperSlide
                                key={index}
                                className="bg-white border border-gray-100 rounded-[2.5rem] p-8 flex flex-col items-center shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-300 group"
                            >
                                {/* Customer Image Circle */}
                                <div className="relative">
                                    <div className='w-24 h-24 bg-pink-50 rounded-full overflow-hidden flex justify-center items-center border-2 border-white ring-4 ring-pink-50/50'>
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt={name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : (
                                            <span className='text-4xl group-hover:scale-110 transition-transform duration-300 text-gray-400'>
                                                <FaRegUser />
                                            </span>
                                        )}
                                    </div>

                                    {/* quote icon */}
                                    <div className="absolute -bottom-2 -right-2 bg-pink-500 text-white p-2 rounded-full shadow-lg">
                                        <FaQuoteRight size={12} />
                                    </div>
                                </div>

                                {/* Name */}
                                <h3 className="mt-6 text-gray-900 font-bold text-xl tracking-tight">
                                    {name}
                                </h3>

                                {/* Rating Stars */}
                                <div className="flex justify-center gap-1 my-3">
                                    {renderStars(ratingValue)}
                                </div>

                                {/* Review */}
                                <p className="text-[14px] text-gray-500 text-center leading-relaxed italic px-2">
                                    "{reviewText}"
                                </p>

                                {/* Bottom Icon/Badge */}
                                <div className="mt-6 pt-6 border-t border-gray-50 w-full flex justify-center">
                                    <div className="flex items-center gap-2 text-pink-400 opacity-70 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[18px]">
                                            {socialBadge.icon}
                                            </span>
                                        <span className="text-[10px] uppercase tracking-widest font-bold">
                                            {socialBadge.name} Review
                                            </span>
                                    </div>
                                </div>
                            </SwiperSlide>
                        )
                    })}
                </Swiper>
            </div>
        </section>
    )
}

export default HomeReviewSlider;