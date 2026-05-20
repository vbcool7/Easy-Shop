
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';

import { useBestSellerProducts } from '../hook/uesProducts';

function HomeBestSeller() {

    const navigate = useNavigate();
    const { data: bestSellerProds, isLoading } = useBestSellerProducts();

    if (isLoading) return <p>Loading Best Sellers...</p>;

    // no products guard
    if (!bestSellerProds || bestSellerProds.length === 0) return null;

    return (
        <section className="w-full py-8 md:py-16 px-4 lg:px-6">
            <div className="max-w-6xl mx-auto">

                {/* heading */}
                <div className="flex flex-col items-center mb-8 md:mb-12">
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-800 tracking-tight">
                        Best Seller
                    </h2>

                    <div className="w-20 h-1 md:h-1.5 bg-pink-500 rounded-full mt-2 md:mt-3"></div>

                    <p className="text-gray-500 mt-4 text-[12px] text-center md:text-sm uppercase tracking-widest">
                        Most loved by our community • Shop the hits
                    </p>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">

                    {bestSellerProds.slice(0, 8).map((item, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(`/product_detail/${item._id}/${item.prodName}`)}
                            className="group cursor-pointer">
                            <div className="relative aspect-square bg-gray-100 rounded-3xl overflow-hidden mb-4">

                                {/* Hot Badge */}
                                <span className="absolute top-4 left-4 bg-orange-500 text-white text-[8px] md:text-[10px] font-bold px-2 md:px-3 py-1 rounded-full z-10 shadow-lg">
                                    HOT SELLING
                                </span>

                                <img
                                    src={item.prodImage}
                                    alt="BestSellerProds"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* Quick Add Button on Hover */}
                                <div className="absolute inset-x-0 bottom-2 px-4 translate-y-15 group-hover:translate-y-0 transition-transform duration-300">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/shop/${item.vendorId?._id || item.vendorId}`, {
                                                state: {
                                                    storeName: item.vendorId?.storeName,
                                                    storeLogo: item.vendorId?.storeLogo,
                                                    aboutShop: item.vendorId?.aboutShop,
                                                    city: item.vendorId?.city,
                                                    vendorState: item.vendorId?.state,
                                                }
                                            });
                                        }}
                                        className="flex items-center justify-center w-full bg-white/90 backdrop-blur-md text-gray-900 py-3 rounded-xl font-bold shadow-xl cursor-pointer hover:bg-pink-500 hover:text-white transition-all">
                                        View Shop <span className="text-2xl px-2">→</span>
                                    </button>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="space-y-1 px-2">
                                <p className="text-gray-500 text-sm font-serif">{item.prodName}</p>

                                <span className="text-lg font-black text-pink-500 group-hover:text-gray-900 transition-colors">
                                    <span className='text-gray-500 font-medium text-sm mr-1'>Under</span>
                                    <span className="text-sm font-bold mr-0.5">₹</span>{item.price}
                                </span>

                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </section>
    )
}

export default HomeBestSeller;