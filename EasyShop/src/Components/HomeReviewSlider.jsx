
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

import { useTranslation } from 'react-i18next';

function HomeReviewSlider() {

    const { t } = useTranslation();
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

    if (isLoading) return <div className="p-20 text-center">{t('home.loadingReviews')}</div>;
    if (isError) return <div className="p-20 text-center">{t('home.reviewsNotFound')}</div>;

    if (reviews.length === 0) return null;

    return (
        <section className="w-full bg-pink-100/30 px-4 sm:px-5 lg:px-6 py-8 md:py-16">
            <div className="mx-auto max-w-6xl">
                {/* heading */}
                <div className="mb-8 flex flex-col items-center text-center md:mb-12">
                    <h2 className="max-w-88 wrap-break-words text-center text-2xl font-bold leading-tight tracking-tight text-gray-800 sm:max-w-xl md:max-w-3xl md:text-4xl">
                        {t('home.reviewsTitle')}
                    </h2>

                    <div className="mt-3 h-1 w-20 rounded-full bg-pink-500 md:h-1.5"></div>

                    <p className="mt-4 max-w-84 wrap-break-words text-center text-[11px] uppercase leading-relaxed tracking-widest text-gray-500 sm:max-w-2xl sm:text-xs md:text-sm">
                        {t('home.reviewsSubtitle')}
                    </p>
                </div>

                {/* Slider */}
                <Swiper
                    modules={[Autoplay]}
                    slidesPerView={1}
                    spaceBetween={16}
                    loop={reviews.length > 4}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    breakpoints={{
                        480: {
                            slidesPerView: 1,
                            spaceBetween: 16,
                        },
                        640: {
                            slidesPerView: 2,
                            spaceBetween: 18,
                        },
                        1024: {
                            slidesPerView: 3,
                            spaceBetween: 24,
                        },
                        1280: {
                            slidesPerView: 4,
                            spaceBetween: 30,
                        },
                    }}
                    className="px-1 py-10 sm:px-2"
                >
                    {reviews.map((item, index) => {
                        const name = item.userId?.name || t('home.verifiedCustomer');
                        const reviewText = item.review;
                        const avatarUrl = item.userId?.profilePhoto;
                        const ratingValue = item.rating || 5;
                        const socialBadge = SOCIAL_ICONS[index % SOCIAL_ICONS.length];

                        return (
                            <SwiperSlide key={index} className="h-auto">
                                <div className="group flex h-full min-w-0 flex-col items-center rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] sm:p-8 lg:rounded-[2.5rem]">

                                    {/* Customer Image Circle */}
                                    <div className="relative shrink-0">
                                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-pink-50 ring-4 ring-pink-50/50 sm:h-24 sm:w-24">
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt={name}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                />
                                            ) : (
                                                <span className="text-3xl text-gray-400 transition-transform duration-300 group-hover:scale-110 sm:text-4xl">
                                                    <FaRegUser />
                                                </span>
                                            )}
                                        </div>

                                        {/* quote icon */}
                                        <div className="absolute -bottom-2 -right-2 rounded-full bg-pink-500 p-2 text-white shadow-lg">
                                            <FaQuoteRight size={12} />
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <h3 className="mt-6 min-h-6 max-w-full wrap-break-words text-center text-lg font-bold leading-tight tracking-tight text-gray-900 sm:text-xl">
                                        {name}
                                    </h3>

                                    {/* Rating Stars */}
                                    <div className="my-3 flex shrink-0 justify-center gap-1">
                                        {renderStars(ratingValue)}
                                    </div>

                                    {/* Review */}
                                    <p className="line-clamp-5 max-w-full  wrap-break-words px-1 text-center text-[14px] italic leading-relaxed text-gray-500 sm:px-2">
                                        "{reviewText}"
                                    </p>

                                    {/* Bottom Icon/Badge */}
                                    <div className="mt-auto w-full border-t border-gray-50 pt-6">
                                        <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 text-pink-400 opacity-70 transition-opacity group-hover:opacity-100">
                                            <span className="shrink-0 text-[18px]">
                                                {socialBadge.icon}
                                            </span>

                                            <span className="max-w-full  wrap-break-words text-center text-[10px] font-bold uppercase leading-tight tracking-widest">
                                                {socialBadge.name} {t('home.review')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            </div>
        </section>
    );
}

export default HomeReviewSlider;