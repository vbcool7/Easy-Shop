
import React from 'react';
import HomeBannerImg2 from '../assets/Images/HomeBannerImg2.jpg';

function HomeBanner() {
    return (
        <section className="w-full px-4 lg:px-6">

            <div className="relative max-w-6xl mx-auto">

                <div className='w-full h-100 md:h-140'>
                    <img
                        src={HomeBannerImg2}
                        alt="HomeBannerImg"
                        className='w-full h-full object-cover rounded-3xl'
                    />

                    {/* Overlay */}
                    {/* <div className="absolute inset-0 bg-black/20 rounded-3xl"></div> */}

                    <div className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 p-4 md:p-8 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/30 w-[75%] md:w-[60%] lg:w-[40%] shadow-2xl flex flex-col md:gap-4">

                        {/* Decorative Badge */}
                        <span className="bg-pink-500 text-white text-[6px] md:text-[10px] font-bold px-2 md:px-3 py-1 rounded-full w-fit tracking-widest uppercase">
                            Limited Offer
                        </span>

                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                                New <span className="text-pink-400">Products</span>
                            </h1>
                            <p className="text-white text-md md:text-lg font-medium ">
                                Flat 25% off on your first order
                            </p>
                        </div>

                        {/* Price Section */}
                        <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-white text-2xl md:text-3xl font-bold">$199.02</span>
                            <span className="text-white/60 line-through text-sm">$265.00</span>
                        </div>

                        {/* Stylish Button */}
                        <button className="mt-4 hover:bg-white hover:text-pink-500 font-bold py-2 px-2 md:py-3 md:px-8 rounded-xl bg-pink-500 text-white text-sm md:text-md transition-all duration-300 shadow-lg active:scale-95 w-fit cursor-pointer">
                            Shop Now
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HomeBanner;