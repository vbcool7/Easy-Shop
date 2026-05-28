
import React from 'react'
import { useNavigate } from 'react-router-dom';
import { IoBagHandleOutline } from "react-icons/io5";
import { useCart } from './CartContext';
import { useGetSimilarProducts } from '../hook/uesProducts';

function ProductDetailSimilarProd({ prodId }) {

    const navigate = useNavigate();
    const { addToCart } = useCart();

    const { data: similarProducts, isLoading, isError } = useGetSimilarProducts(prodId);

    if (isLoading) return <div className="p-20 text-center">Loading products.....</div>;
    if (isError) return <div className="p-20 text-center">Product Not Found!</div>;

    return (
        <div className="max-w-6xl mx-auto py-8 md:py-16">

            {/* heading */}
            <div className="flex flex-col items-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-4xl font-bold text-gray-800 tracking-tight">
                    You May Also Like
                </h2>

                <div className="w-20 h-1 md:h-1.5 bg-pink-500 rounded-full mt-2 md:mt-3"></div>

                <p className="text-gray-500 mt-4 text-[12px] text-center md:text-sm uppercase tracking-widest">
                    FRESH STYLES INSPIRED BY YOUR RECENT VIEW
                </p>
            </div>

            {/* similar product */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6'>

                {similarProducts.map((product, index) => (
                    <div
                        key={product._id}
                        onClick={() => {
                            navigate(`/product_detail/${product.id}/${product.prodName}`);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className='group cursor-pointer bg-white border border-gray-100 p-2 md:p-3 rounded-2xl hover:shadow-xl transition-all duration-300'
                    >

                        <div className='aspect-3/4 overflow-hidden rounded-xl bg-gray-50 relative'>
                            <img
                                src={product.prodImage}
                                alt={product.prodName}
                                className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                            />

                            {/* add to cart */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(product);
                                }}
                                className='absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm text-pink-600 p-2 rounded-lg flex items-center justify-center gap-2 border border-pink-100 shadow-md transform lg:translate-y-12 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-300 hover:bg-pink-600 hover:text-white active:scale-95 cursor-pointer'
                            >
                                <IoBagHandleOutline className='text-lg' />
                                <span className='text-[10px] md:text-xs font-bold uppercase'>
                                    Add
                                </span>
                            </button>
                        </div>

                        {/* content */}
                        <div className='mt-3 md:mt-4 px-1'>
                            <h3 className='font-bold text-gray-800 text-sm md:text-md truncate'>
                                {product.prodName}
                            </h3>
                            <p className='text-[12px] md:text-sm text-gray-500 truncate'>
                                {product.description}
                            </p>

                            <div className='flex flex-wrap items-center gap-1 md:gap-2 mt-2'>
                                <span className='font-bold text-pink-600 text-sm md:text-md'>
                                    ₹{product.price}
                                </span>
                                <span className='text-[10px] md:text-sm text-gray-400 line-through'>
                                    ₹{product.originalPrice}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ProductDetailSimilarProd;