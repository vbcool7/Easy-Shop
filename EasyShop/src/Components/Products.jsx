
import React from 'react'
import { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { GoHeart } from "react-icons/go";
import { GoHeartFill } from "react-icons/go";
import { IoMdStar } from "react-icons/io";
import { IoMdStarOutline } from "react-icons/io";
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

function Products() {

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
    if (isError) return <div className="p-20 text-center text-red-500">Error loading products</div>;

    if (!isLoading && (!allProducts || allProducts.length === 0)) {
        return <div className="p-20 text-center">No products found</div>;
    }

    return (
        <section className="w-full py-10">
            <div className="max-w-6xl mx-auto flex flex-wrap md:flex-nowrap gap-6">

                {/* filters part */}
                <div className='w-[30%] bg-gray-50 rounded-lg'>
                    <ProductsFilterPart
                        activeCatId={catId}
                        catName={catName}
                        onFilterChange={setActiveFilters}
                        defaultSubCat={preSelectedSubCat}
                    />
                </div>

                {/* products part */}
                <div className='w-[70%]'>

                    {/* breadcrumps */}
                    <Breadcrumbs items={breadcrumbItems} />

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                                    className="group relative cursor-pointer bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
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
                                                <SwiperSlide
                                                    key={imgIdx}
                                                    className="w-full h-full">
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
                                    <div className="relative flex flex-col flex-1 px-4 pb-4 bg-white overflow-hidden transition-all duration-300">

                                        {/* prod name */}
                                        <p className="text-gray-950 font-extrabold text-[13px] uppercase tracking-wider mb-0.5 truncate">
                                            {product.prodName}
                                        </p>

                                        {/* description */}
                                        <h3 className="line-clamp-2 text-gray-500 text-[13px] leading-snug min-h-9 mb-2">
                                            {product.description}
                                        </h3>

                                        {/* price, rating */}
                                        <div className="mt-auto transition-transform duration-300 ease-out group-hover:translate-y-2">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-gray-900 text-base font-bold">
                                                    ₹{product.price}
                                                </span>

                                                {product.originalPrice > product.price && (
                                                    <span className="text-gray-400 line-through text-[12px]">
                                                        ₹{product.originalPrice}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Rating Stars */}
                                            <div className="flex items-center gap-0.5 mt-1 text-yellow-400 text-sm">
                                                <IoMdStar />
                                                <IoMdStar />
                                                <IoMdStar />
                                                <IoMdStar />
                                                <IoMdStarOutline className="text-gray-300" />
                                                <span className="text-[11px] text-gray-400 ml-1">
                                                    ({product.totalReviews})
                                                </span>
                                            </div>
                                        </div>

                                        {/* add to cart */}
                                        <div className="absolute left-0 -bottom-full w-full px-4 pb-4 pt-2 bg-white transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 group-hover:bottom-0 z-10">
                                            <button
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white text-[13px] font-semibold tracking-wide rounded-lg cursor-pointer transition-colors shadow-sm uppercase"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>

            </div>
        </section>
    )
}

export default Products;