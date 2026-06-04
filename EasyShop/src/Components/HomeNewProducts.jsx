
import React, { useEffect } from 'react'
import { GoHeart } from "react-icons/go";
import { GoHeartFill } from "react-icons/go";
import { IoMdStar } from "react-icons/io";
import { IoMdStarOutline } from "react-icons/io";
import toast from 'react-hot-toast';

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from "swiper/modules";
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { useWishList } from './WishListContext';

import { useNewArrivalProducts } from '../hook/uesProducts';
import { useTranslation } from 'react-i18next';

function HomeNewProducts() {

    const { t } = useTranslation();
    const { addToCart } = useCart();
    const { wishListItems, addToWishList } = useWishList();

    const navigate = useNavigate();
    const { data: newProducts, isLoading } = useNewArrivalProducts();

    // add to cart
    const handleAddToCart = (product) => {

        const variants = product.variants || [];
        const availableVariants = variants.filter(v => v.stock > 0);

        const colorValues = product.attributes?.Color?.values || [];
        const sizeValues = product.attributes?.Size?.values || [];

        const hasMultipleChoices =
            colorValues.length > 1 ||
            sizeValues.length > 1 ||
            availableVariants.length > 1;

        if (hasMultipleChoices) {
            toast.error(t('home.selectOptions'));
            navigate(`/product_detail/${product._id}/${product.prodName}`);
            return;
        }

        const variant = availableVariants[0];

        if (!variant) {
            toast.error(t('home.outOfStock'));
            return;
        }

        const variantImage = variant.color
            ? product.attributes?.Color?.images?.[variant.color]?.[0] || product.prodImage
            : product.prodImage;

        addToCart({
            ...product,
            id: product._id,
            selectedColor: variant.color || null,
            selectedSize: variant.size || null,
            variantId: variant._id,
            prodImage: variantImage
        });
    };

    if (isLoading) return <p>{t('home.loadingNewArrivals')}</p>;

    return (
        <section className="w-full bg-pink-100/30 px-4 sm:px-5 lg:px-6 py-10 md:py-16">
            <div className="mx-auto max-w-6xl">

                {/* heading */}
                <div className="mb-8 flex flex-col items-center text-center md:mb-12">
                    <h2 className="max-w-88 wrap-break-words text-center text-2xl font-bold leading-tight tracking-tight text-gray-800 sm:max-w-xl md:max-w-3xl md:text-4xl">
                        {t('home.newProducts')}
                    </h2>

                    <div className="mt-3 h-1 w-20 rounded-full bg-pink-500 md:h-1.5"></div>

                    <p className="mt-4 max-w-84 wrap-break-words text-center text-[11px] uppercase leading-relaxed tracking-widest text-gray-500 sm:max-w-2xl sm:text-xs md:text-sm">
                        {t('home.newestFavorites')}
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
                        slidesPerView={1}
                        spaceBetween={14}
                        loop={true}
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
                                spaceBetween: 20,
                            },
                            1280: {
                                slidesPerView: 4,
                                spaceBetween: 20,
                            },
                        }}
                        className="pb-14"
                    >
                        {newProducts.slice(0, 8).map((prod, index) => {
                            const isFavorite = wishListItems.some((wishItem) => {
                                const wishId = wishItem.productId?._id || wishItem._id || wishItem.id;
                                const currentProdId = prod?._id || prod?.id;
                                return wishId === currentProdId;
                            });

                            return (
                                <SwiperSlide key={index} className="h-auto">
                                    <div className="group relative flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">

                                        {/* Image Section */}
                                        <div className="relative h-56 overflow-hidden sm:h-60">
                                            <img
                                                src={prod.prodImage}
                                                alt={prod.prodName}
                                                onClick={() =>
                                                    navigate(`/product_detail/${prod._id}/${prod.prodName}`)
                                                }
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />

                                            {/* Badges */}
                                            <div className="absolute left-3 top-3 z-10 max-w-[70%] rounded-full bg-pink-500 px-3 py-1 text-center text-[10px] font-bold uppercase leading-tight tracking-wider text-white shadow-lg">
                                                {t('home.newBadge')}
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToWishList({ ...prod, id: prod?._id || prod?.id });
                                                }}
                                                className={`absolute right-3 top-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border shadow-lg transition-all duration-300 active:scale-90 md:right-5 md:top-5 md:h-9 md:w-9 ${isFavorite
                                                    ? 'border-pink-500 bg-pink-500 text-white'
                                                    : 'border-white bg-white/70 text-gray-600 backdrop-blur-md hover:bg-white hover:text-pink-500'
                                                    }`}
                                            >
                                                <div className="transition-transform duration-300">
                                                    {isFavorite ? (
                                                        <GoHeartFill className="text-xl" />
                                                    ) : (
                                                        <GoHeart className="text-xl" />
                                                    )}
                                                </div>
                                            </button>

                                            {/* Add to Cart Button */}
                                            <div className="absolute bottom-0 left-0 z-20 w-full p-3 opacity-100 translate-y-0 transition-all duration-500 ease-in-out md:translate-y-full md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCart(prod);
                                                    }}
                                                    className="min-h-11 w-full cursor-pointer rounded-lg bg-pink-500 px-3 py-2 text-center text-xs font-bold leading-tight text-white shadow-xl transition-all hover:bg-pink-600 active:scale-95 sm:text-sm"
                                                >
                                                    {t('home.addToCart')}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div
                                            onClick={() =>
                                                navigate(`/product_detail/${prod._id}/${prod.prodName}`)
                                            }
                                            className="flex min-w-0 flex-1 flex-col items-center justify-start p-4 text-center"
                                        >
                                            <p className="mb-1 min-h-9 max-w-full wrap-break-words text-center text-[12px] font-bold uppercase leading-snug tracking-widest text-gray-900">
                                                {prod.prodName}
                                            </p>

                                            <h3 className="line-clamp-2 min-h-10 max-w-full wrap-break-words px-2 text-center text-[13px] leading-snug text-gray-500 transition-colors hover:text-pink-500">
                                                {prod.description}
                                            </h3>

                                            {/* Price Tag */}
                                            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                                                <span className="text-lg font-bold text-pink-500">
                                                    ₹{prod.price}
                                                </span>

                                                <span className="text-xs text-gray-400 line-through">
                                                    ₹{prod.originalPrice}
                                                </span>
                                            </div>

                                            {/* Rating Stars */}
                                            <div className="mt-2 flex gap-0.5 text-md text-yellow-400">
                                                <IoMdStar />
                                                <IoMdStar />
                                                <IoMdStar />
                                                <IoMdStar />
                                                <IoMdStarOutline />
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}

export default HomeNewProducts;