
import React, { useState } from 'react';
import { HiOutlineShoppingBag } from "react-icons/hi";
import { HiOutlineHeart } from "react-icons/hi";
import { HiOutlineTrash } from "react-icons/hi";

import { useWishList } from './WishListContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';

function WishList() {

    const { wishListItems, removeFromWishList } = useWishList();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    return (
        <section className="w-full min-h-[70vh] bg-white py-8 md:py-16 px-4 lg:px-6">
            <div className="max-w-6xl mx-auto">

                {/* heading */}
                <div className="flex flex-col items-center mb-12">
                    <h1 className='text-2xl md:text-3xl text-pink-500 font-bold tracking-tight'>
                        My Wishlist
                    </h1>
                    <div className="h-1 w-15 md:w-20 bg-pink-500 rounded-full mt-2 opacity-30"></div>
                </div>

                {wishListItems.length > 0 ? (
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>

                        {wishListItems.map((item, index) => {

                            const product = item.productId;

                            return (
                                <div
                                    key={index}
                                    onClick={() => navigate(`/product_detail/${product?._id}/${product?.prodName}`)}
                                    className="group relative bg-white border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-pink-100/50 transition-all duration-300 cursor-pointer">

                                    {/* Remove Icon */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromWishList(product?._id);
                                        }}
                                        className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-white shadow-sm transition-all cursor-pointer">
                                        <HiOutlineTrash size={18} />
                                    </button>

                                    {/* Product Image */}
                                    <div className="aspect-square overflow-hidden bg-gray-50">
                                        <img
                                            src={item?.prodImage || item?.productId?.prodImage}
                                            alt={product?.prodName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="p-4 text-left">
                                        <h3 className="text-sm font-medium text-gray-800 truncate hover:text-pink-500 transition-colors cursor-pointer">
                                            {product?.prodName}
                                        </h3>

                                        <div className="flex items-baseline gap-2 mt-1">
                                            <span className="text-lg font-bold text-pink-500">
                                                ₹{product?.price}
                                            </span>
                                        </div>

                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart({
                                                    ...product,
                                                    prodImage: item?.prodImage || product?.prodImage,
                                                    selectedColor: item?.selectedColor || null,
                                                    selectedSize: item?.selectedSize || null,
                                                });
                                            }}
                                            className="w-full mt-4 bg-pink-50 border border-pink-100 text-pink-500 hover:bg-pink-500 hover:text-white font-bold py-2.5 rounded-2xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm hover:shadow-pink-200">
                                            <HiOutlineShoppingBag className='text-lg' />
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-20 px-4 min-h-100">
                        <div className="w-18 h-18 md:w-24 md:h-24 bg-pink-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <HiOutlineHeart className="text-pink-300 text-3xl md:text-5xl" />
                        </div>
                        <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">
                            Your wishlist is empty 🌸
                        </h2>
                        <p className="text-sm md:text-lg text-gray-500 mt-3 mb-10 max-w-70 md:max-w-md mx-auto leading-relaxed">
                            Save items that you like in your wishlist!
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-pink-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-pink-100 hover:bg-pink-600 transition-all cursor-pointer">
                            Explore Products
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}

export default WishList;