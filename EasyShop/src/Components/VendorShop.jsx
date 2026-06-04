
import React from 'react';
import ShopBannerImg1 from '../assets/Images/ShopBannerImg1.jpg'
import { IoMdTime, IoMdPin } from "react-icons/io";
import { IoMdStar } from "react-icons/io";
import { IoMdStarOutline } from "react-icons/io";
import { IoBagHandleOutline } from "react-icons/io5";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { IoIosArrowDown } from "react-icons/io";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useVendorShopProducts } from '../hook/uesProducts';
import { useCart } from './CartContext';
import { useWishList } from './WishListContext';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useGetBanners } from '../hook/useBanner';
import { useTranslation } from 'react-i18next';

function VendorShop() {

    const { t } = useTranslation();
    const { vendorId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const vendorInfo = location.state;

    const { addToCart } = useCart();
    const { wishListItems, addToWishList } = useWishList();

    const { data, fetchNextPage, hasNextPage, isLoading, isError } = useVendorShopProducts(vendorId);
    const { data: banners } = useGetBanners('vendor_top');
    const banner = banners?.[0];

    const imageUrl = banner?.image || ShopBannerImg1;

    const products = data?.pages.flatMap(page => page.data) || [];

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
            toast.error("Please select options");
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
            selectedColor: variant.color || null,
            selectedSize: variant.size || null,
            variantId: variant._id,
            prodImage: variantImage
        });
    };

    const handleWishList = (e, product) => { e.stopPropagation(); addToWishList(product); };

    return (
        <section className="w-full pb-10">

            {/* banner */}
            <div className="relative h-48 md:h-64 lg:h-80 w-full overflow-hidden">
                <img
                    src={imageUrl}
                    alt="Shop Banner"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* 2. Shop Info */}
            <div className="max-w-6xl mx-auto px-4 lg:px-6 -mt-12 md:-mt-16 relative z-10 mb-12">
                <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100 flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6">

                    <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-xl shadow-md border-4 border-white overflow-hidden shrink-0">
                        {vendorInfo?.storeLogo ? (
                            <img
                                src={vendorInfo.storeLogo}
                                alt="Logo"
                                className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-pink-50 flex items-center justify-center text-pink-500 text-2xl font-black">
                                {vendorInfo?.storeName?.charAt(0) || 'S'}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">
                            {vendorInfo?.storeName || 'Vendor Shop'}
                        </h1>

                        {vendorInfo?.aboutShop && (
                            <p className="text-gray-500 text-xs md:text-sm my-1 max-w-xl line-clamp-2">
                                {vendorInfo.aboutShop}
                            </p>
                        )}

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-xs md:text-sm text-gray-400 font-semibold">
                            <span className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full">
                                <IoMdPin className="text-pink-500" />
                                {[vendorInfo?.city, vendorInfo?.vendorState].filter(Boolean).join(', ')}
                            </span>
                            <span className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full">
                                <IoBagHandleOutline className="text-pink-500" />
                                {products?.length || 0} {t('vendorShop.products')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Products Grid */}
            <div className='max-w-6xl mx-auto px-4 lg:px-6'>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 border-l-4 border-pink-500 pl-3 leading-tight">
                        {t('vendorShop.storeCollection')}
                    </h2>
                </div>

                {/* Grid config remains the same */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {(products || []).map((product) => {

                        const isFavorite = wishListItems.some((wishItem) => {
                            const wishId = wishItem.productId?._id || wishItem._id || wishItem.id;
                            return wishId === product._id;
                        });

                        return (
                            <div
                                key={product._id}
                                onClick={() => navigate(`/product_detail/${product._id}/${product.prodName}`)}

                                className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                            >
                                <div>
                                    {/* Image Container */}
                                    <div className="relative aspect-4/5 overflow-hidden">
                                        <img
                                            src={product.prodImage}
                                            alt={product.prodName}
                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        {/* Wishlist Button */}
                                        <div
                                            onClick={(e) => handleWishList(e, product)}
                                            className={`absolute right-3 top-3 p-2 rounded-full shadow-md cursor-pointer z-10 transition-all duration-300
                                ${isFavorite ? 'bg-pink-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-pink-500 hover:text-white'}`}
                                        >
                                            {isFavorite ? <GoHeartFill className="text-lg" /> : <GoHeart className="text-lg" />}
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-3 md:p-4 text-center">
                                        <h3 className="text-gray-800 font-bold text-xs md:text-sm uppercase truncate mb-1">
                                            {product.prodName}
                                        </h3>

                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-pink-500 text-base md:text-lg font-black">
                                                ₹{product.price}
                                            </span>

                                            {product.originalPrice > product.price && (
                                                <span className="text-gray-400 line-through text-[10px] md:text-xs">
                                                    ₹{product.originalPrice}
                                                </span>
                                            )}
                                        </div>

                                        {/* Rating */}
                                        <div className="flex justify-center gap-0.5 mt-1 text-yellow-400">
                                            <IoMdStar />
                                            <IoMdStar />
                                            <IoMdStar />
                                            <IoMdStar />
                                            <IoMdStarOutline />
                                        </div>
                                    </div>
                                </div>
                               
                                {/* add to cart */}
                                <div className="p-3 pt-0 text-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(product);
                                        }}
                                        className="w-full py-2.5 px-1 bg-gray-900 text-white text-[9px] sm:text-[10px] md:text-xs font-bold rounded-lg uppercase tracking-wider hover:bg-pink-500 transition-colors duration-300 truncate"
                                        title={t('vendorShop.addToCart')}
                                    >
                                        {t('vendorShop.addToCart')}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Load More Section */}
                {hasNextPage && (
                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => fetchNextPage()}
                            className="px-8 py-2 border-2 border-pink-500 text-pink-500 font-bold rounded-full hover:bg-pink-500 hover:text-white transition-all duration-300 cursor-pointer"
                        >
                            {t('vendorShop.loadMore')}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default VendorShop;