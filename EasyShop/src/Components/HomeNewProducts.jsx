
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

function HomeNewProducts() {

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

    if (isLoading) return <p>Loading New Arrivals...</p>;

    return (
        <section className="w-full bg-pink-100/30 py-10 md:py-16 px-4 lg:px-6">
            <div className="max-w-6xl mx-auto">

                {/* heading */}
                <div className="flex flex-col items-center mb-8 md:mb-12">
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-800 tracking-tight">
                        New Products
                    </h2>

                    <div className="w-20 h-1 md:h-1.5 bg-pink-500 rounded-full mt-2 md:mt-3"></div>

                    <p className="text-gray-500 mt-4 text-[12px] md:text-sm uppercase tracking-widest">
                        Our newest favorites, ready for yours
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
                        spaceBetween={20}
                        loop={true}
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        breakpoints={{
                            0: { slidesPerView: 1 },
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                            1280: { slidesPerView: 4 },
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
                                <SwiperSlide key={index}>
                                    <div
                                        className="group relative bg-white flex flex-col shadow-md rounded-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 cursor-pointer">

                                        {/* Image Section */}
                                        <div className='relative h-55 md:h-60 overflow-hidden'>
                                            <img
                                                src={prod.prodImage}
                                                alt={prod.prodName}
                                                onClick={() => navigate(`/product_detail/${prod._id}/${prod.prodName}`)}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />

                                            {/* Badges */}
                                            <div className='absolute top-3 left-3 text-white px-3 py-1 bg-pink-500 text-[10px] font-bold rounded-full shadow-lg uppercase tracking-wider z-10'>
                                                New
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Pass product along with a forced id for context consistency
                                                    addToWishList({ ...prod, id: prod?._id || prod?.id });
                                                }}
                                                className={`absolute top-3 right-3 md:top-5 md:right-5 z-20 w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 active:scale-90 border cursor-pointer
                                                        ${isFavorite
                                                        ? 'bg-pink-500 text-white border-pink-500'
                                                        : 'bg-white/70 backdrop-blur-md text-gray-600 border-white hover:bg-white hover:text-pink-500'}`}
                                            >
                                                <div className="transition-transform duration-300 ">
                                                    {isFavorite ? <GoHeartFill className='text-xl ' /> : <GoHeart className='text-xl ' />}
                                                </div>
                                            </button>

                                            {/* Add to Cart Button */}
                                            <div className="absolute bottom-0 left-0 w-full p-3 transform translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out z-20">

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCart(prod);
                                                    }}
                                                    className="w-full bg-pink-500 text-white text-xs font-bold py-3 rounded-lg shadow-xl hover:bg-pink-600 active:scale-95 transition-all cursor-pointer">
                                                    ADD TO CART
                                                </button>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div
                                            onClick={() => navigate(`/product_detail/${prod.id}/${prod.subCategory}/${prod.name}`)}
                                            className='flex flex-col items-center justify-center md:flex-1 p-4'>

                                            <p className='text-center text-gray-900 font-bold text-[12px] uppercase tracking-widest mb-1'>
                                                {prod.prodName}
                                            </p>

                                            <h3 className='text-gray-500 px-4 text-[13px] text-center line-clamp-1 hover:text-pink-500 cursor-pointer transition-colors'>
                                                {prod.description}
                                            </h3>

                                            {/* Price Tag */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <span
                                                    className="text-pink-500 text-lg font-bold">
                                                    ₹{prod.price}
                                                </span>

                                                <span
                                                    className="text-gray-400 line-through text-xs">
                                                    ₹{prod.originalPrice}
                                                </span>

                                            </div>

                                            {/* Rating Stars */}
                                            <div className='flex gap-0.5 mt-2 text-md text-yellow-400'>
                                                <IoMdStar />
                                                <IoMdStar />
                                                <IoMdStar />
                                                <IoMdStar />
                                                <IoMdStarOutline />
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            )

                        })}
                    </Swiper>
                </div>

            </div>
        </section>
    )
}

export default HomeNewProducts;