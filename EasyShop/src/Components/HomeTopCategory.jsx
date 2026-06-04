
import React from 'react'
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from "swiper/modules";
import { useNavigate } from 'react-router-dom';

import { useCatList } from '../hook/useCategories';

import { useTranslation } from 'react-i18next';

function HomeTopCategory() {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const { data: categories, isLoading, isError } = useCatList();

    if (isLoading) return <p className="text-center py-10">{t('home.loadingCollections')}</p>;
    if (isError) return <p className="text-center py-10 text-red-500">{t('home.somethingWrong')}</p>;

    // filter only active cat
    const activeCats = categories?.filter(cat => cat.isActive) || [];

    return (
        <section className="w-full bg-white px-4 sm:px-5 lg:px-6 md:py-16 py-10">
            <div className="mx-auto max-w-6xl">
                
                {/* heading */}
                <div className="mb-8 flex flex-col items-center text-center md:mb-12">
                    <h2 className="max-w-88 wrap-break-words text-center text-2xl font-bold leading-tight tracking-tight text-gray-800 sm:max-w-120 md:max-w-3xl md:text-4xl">
                        {t('home.topCategories')}
                    </h2>

                    <div className="mt-3 h-1 w-20 rounded-full bg-pink-500 md:h-1.5"></div>

                    <p className="mt-4 max-w-[20rem] wrap-break-words text-center text-[11px] uppercase leading-relaxed tracking-widest text-gray-500 sm:max-w-2xl sm:text-xs md:text-sm">
                        {t('home.discoverCollection')}
                    </p>
                </div>

                {/* Slider Container */}
                <div className="category-slider">
                    <Swiper
                        modules={[Autoplay, Pagination]}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true,
                        }}
                        slidesPerView={2}
                        spaceBetween={12}
                        loop={true}
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        breakpoints={{
                            480: {
                                slidesPerView: 2,
                                spaceBetween: 16,
                            },
                            640: {
                                slidesPerView: 3,
                                spaceBetween: 18,
                            },
                            1024: {
                                slidesPerView: 5,
                                spaceBetween: 20,
                            },
                            1280: {
                                slidesPerView: 6,
                                spaceBetween: 20,
                            },
                        }}
                        className="pb-14"
                    >
                        {activeCats.slice(0, 8).map((category, index) => (
                            <SwiperSlide key={index}>
                                <div
                                    onClick={() =>
                                        navigate(`/all_products/${category._id}/${category.catName}`)
                                    }
                                    className="group flex min-w-0 cursor-pointer flex-col items-center text-center"
                                >
                                    {/* Circle Container with Animation */}
                                    <div className="relative aspect-square w-28 overflow-hidden rounded-full border-y-3 border-gray-50 shadow-md transition-all duration-500 group-hover:border-pink-500 xs:w-32 sm:w-36 md:w-40 lg:w-44">
                                        <img
                                            src={category.catImage}
                                            alt={category.catName}
                                            className="h-full w-full rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Name Section */}
                                    <div className="mt-5 flex min-h-17 w-full max-w-44 flex-col items-center text-center">
                                        <p className="max-w-full wrap-break-words text-center text-sm font-bold uppercase leading-snug tracking-wide text-gray-800 transition-colors group-hover:text-pink-600 sm:text-base">
                                            {category.catName}
                                        </p>

                                        <span className="mt-1 text-[11px] font-medium text-gray-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            {t('home.shopNow')}
                                        </span>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    )
}

export default HomeTopCategory;