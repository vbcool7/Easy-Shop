
import React from 'react'
import { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import ProductsBanner from './ProductsBanner';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { GoHeart } from "react-icons/go";
import { GoHeartFill } from "react-icons/go";
import { IoMdStar } from "react-icons/io";
import { IoMdStarOutline } from "react-icons/io";
import { HiOutlineFilter, HiOutlineX } from 'react-icons/hi';
import ProductsFilterPart from './ProductsFilterPart';
import Breadcrumbs from './Breadcrumbs';
import { useCart } from './CartContext';
import { useWishList } from './WishListContext';
import EasyShopLoader from './EasyShopLoader';
import { useProductsByCategory } from '../hook/uesProducts';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useTranslation } from 'react-i18next';

function Products() {

    const { t } = useTranslation();
    const { catId, catName } = useParams();
    const { addToCart } = useCart();
    const { wishListItems, addToWishList } = useWishList();

    const navigate = useNavigate();
    const swiperRefs = useRef({});

    const [searchParams] = useSearchParams();
    const preSelectedSubCat = searchParams.get('subCatId');

    const [activeFilters, setActiveFilters] = useState(
        preSelectedSubCat ? { subCatId: preSelectedSubCat } : {}
    );

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const { data: allProducts, isLoading, isError } = useProductsByCategory(catId, activeFilters);

    // selected color imgs
    const selectColor = activeFilters?.attributes?.Color;

    // breadcrumbs
    const breadcrumbItems = [
        { label: "Home", path: "/" },
        {
            label: catName || "All Products",
            path: `/all_products/${catId}/${catName}`
        },
    ];

    // cart
    const handleAddToCart = (e, product) => {
        e.stopPropagation();

        const variants = product.variants || [];
        const availableVariants = variants.filter(v => v.stock > 0);

        const hasMultipleChoices = availableVariants.length > 1;

        if (hasMultipleChoices) {
            toast.error("Please select color and size");
            navigate(`/product_detail/${product._id}/${product.prodName}`);
            return;
        }

        const variant = availableVariants[0];

        if (!variant) {
            toast.error("Product is out of stock");
            return;
        }

        const variantImage = variant.color
            ? product.attributes?.Color?.images?.[variant.color]?.[0] || product.prodImage
            : product.prodImage;

        addToCart({
            ...product,
            id: product._id,
            quantity: 1,
            selectedColor: variant.color || null,
            selectedSize: variant.size || null,
            variantId: variant._id,
            prodImage: variantImage
        });
    };

    // wishlist
    const handleWishList = (e, product) => {
        e.stopPropagation();
        addToWishList(product);
    };

    if (isLoading && !allProducts) return <EasyShopLoader />;
    if (isError) return <div className="p-20 text-center text-red-500">{t('products.errorLoading')}</div>;

    if (!isLoading && (!allProducts || allProducts.length === 0)) {
        return <div className="p-20 text-center">{t('products.notFound')}</div>;
    }

    return (
        <section className="w-full pb-15 bg-white dark:bg-slate-900 text-left">

            {/* Top Banner */}
            <ProductsBanner />

            {/* Main section */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-0 flex flex-col lg:flex-row gap-6 mt-6">

                {/* ======== DESKTOP SIDEBAR FILTER ========== */}
                <aside className='hidden lg:block w-[25%] shrink-0 sticky top-24 h-fit bg-gray-50 dark:bg-slate-800 rounded-2xl p-2'>
                    <ProductsFilterPart
                        activeCatId={catId}
                        catName={catName}
                        onFilterChange={setActiveFilters}
                        defaultSubCat={preSelectedSubCat}
                    />
                </aside>

                {/* prod content */}
                <div className='flex-1 w-full'>

                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 mb-4">

                        {/* Breadcrumbs */}
                        <Breadcrumbs items={breadcrumbItems} />

                        {/* Mobile and Tablet Only Filter Action Button */}
                        <button
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-gray-800 dark:text-slate-200 text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                            <HiOutlineFilter size={15} className="text-pink-500" />
                            {t('products.filters')}
                        </button>
                    </div>

                    {/* =========== RESPONSIVE PRODUCT GRID ============ */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
                        {allProducts.map((product, index) => {

                            const colorImages = product.attributes?.Color?.images?.[selectColor];
                            const allProductImages = colorImages?.length > 0
                                ? colorImages
                                : [product.prodImage, ...(product.prodImages || [])];

                            const isFavorite = wishListItems.some((wishItem) => {
                                const wishId = wishItem.productId?._id || wishItem._id || wishItem.id;
                                return wishId === product._id;
                            });

                            return (
                                <div
                                    key={product._id || index}
                                    onClick={() => navigate(`/product_detail/${product._id}/${product.prodName}`, { state: { selectColor } })}
                                    onMouseEnter={() => {
                                        const swiper = swiperRefs.current[product._id];
                                        if (swiper && allProductImages.length > 1) {
                                            swiper.autoplay.start();
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        const swiper = swiperRefs.current[product._id];
                                        if (swiper) {
                                            swiper.autoplay.stop();
                                            swiper.slideTo(0);
                                        }
                                    }}
                                    className="group relative cursor-pointer bg-white rounded-xl overflow-hidden shadow-xs border border-slate-100/60 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                                >
                                    {/* Image Section */}
                                    <div className="product-card-swiper relative w-full aspect-3/4 bg-gray-50 overflow-hidden">
                                        <Swiper
                                            modules={[Autoplay, Pagination]}
                                            onSwiper={(swiper) => {
                                                swiperRefs.current[product._id] = swiper;
                                                swiper.autoplay.stop();
                                            }}
                                            autoplay={{
                                                delay: 1500,
                                                disableOnInteraction: false,
                                            }}
                                            pagination={false}
                                            className="w-full h-full"
                                        >
                                            {allProductImages.map((img, imgIdx) => (
                                                <SwiperSlide key={imgIdx} className="w-full h-full">
                                                    <img
                                                        src={img}
                                                        alt={`${product.prodName}-${imgIdx}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>

                                        {/* Wishlist Button */}
                                        <div
                                            onClick={(e) => handleWishList(e, product)}
                                            className={`absolute right-3 top-3 p-2 rounded-full shadow-sm cursor-pointer transition-all duration-300 z-10 
                                            ${isFavorite ? 'bg-pink-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-white hover:scale-110'}`}
                                        >
                                            {isFavorite ? <GoHeartFill className="text-lg" /> : <GoHeart className="text-lg" />}
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="relative flex flex-col flex-1 px-3 sm:px-4 pb-4 bg-white overflow-hidden transition-all duration-300">
                                        <p className="text-gray-950 font-extrabold text-[12px] sm:text-[13px] uppercase tracking-wider mb-0.5 mt-3 truncate">
                                            {product.prodName}
                                        </p>

                                        <h3 className="line-clamp-2 text-gray-500 text-[11px] sm:text-[13px] leading-snug min-h-8 sm:min-h-9 mb-2">
                                            {product.description}
                                        </h3>

                                        <div className="mt-auto transition-transform duration-300 ease-out sm:group-hover:translate-y-2">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-gray-900 text-sm sm:text-base font-bold">
                                                    ₹{product.price}
                                                </span>
                                                {product.originalPrice > product.price && (
                                                    <span className="text-gray-400 line-through text-[11px] sm:text-[12px]">
                                                        ₹{product.originalPrice}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Rating Stars */}
                                            <div className="flex items-center gap-0.5 mt-1 text-yellow-400 text-xs sm:text-sm">
                                                <IoMdStar />
                                                <IoMdStar />
                                                <IoMdStar />
                                                <IoMdStar />
                                                <IoMdStarOutline className="text-gray-300" />
                                                <span className="text-[10px] sm:text-[11px] text-gray-400 ml-1">
                                                    ({product.totalReviews})
                                                </span>
                                            </div>
                                        </div>

                                        {/* Add to cart */}
                                        <div className="hidden md:block absolute left-0 -bottom-full w-full px-4 pb-4 pt-2 bg-white transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 group-hover:bottom-0 z-10">
                                            <button
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white text-[13px] font-semibold tracking-wide rounded-lg cursor-pointer transition-colors shadow-sm uppercase"
                                            >
                                                {t('products.addToCart')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mobile Direct Add to Cart Action */}
                                    <div className="block md:hidden px-3 pb-3 bg-white">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleAddToCart(e, product); }}
                                            className="w-full py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg uppercase tracking-wide active:bg-pink-500"
                                        >
                                            {t('products.addToCart')}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ============= SLIDING MOBILE FILTER DRAWER ================= */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex justify-end">

                    {/* overlay */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />

                    {/* Filter Sheet Side Panel */}
                    <div className="relative w-full max-w-xs h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-10 animate-fade-in">

                        {/* Drawer Header Layout */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-sm font-black uppercase text-gray-800 dark:text-slate-200">
                                {t('products.refineFilters')}
                            </h2>
                            <button
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-gray-500 active:scale-95 cursor-pointer"
                            >
                                <HiOutlineX size={18} />
                            </button>
                        </div>

                        {/* Drawer Scrollable Middle Body */}
                        <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50">

                            <ProductsFilterPart
                                activeCatId={catId}
                                catName={catName}
                                onFilterChange={setActiveFilters}
                                defaultSubCat={preSelectedSubCat}
                            />
                        </div>

                        {/* apply filter btn */}
                        <div className="p-4 border-t border-slate-100 bg-white grid grid-cols-1">
                            <button
                                onClick={() => setIsMobileFilterOpen(false)}
                                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 text-center shadow-lg cursor-pointer uppercase tracking-wider"
                            >
                                {t('products.applyFilters')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </section>
    );
}

export default Products;