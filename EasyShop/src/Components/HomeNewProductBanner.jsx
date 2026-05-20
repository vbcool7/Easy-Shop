
import React from 'react'
import NewProductBanner from '../assets/Images/NewProductBanner.jpg';

function HomeNewProductBanner() {
    return (
        <section className="w-full md:py-10 px-4 lg:px-6">
            <div className="relative max-w-6xl mx-auto">

                <div className='w-full h-100 md:h-120'>
                    <img
                        src={NewProductBanner}
                        alt="NewProductBanner"
                        className='w-full h-full object-cover rounded-2xl'
                    />

                    <div className="absolute inset-0"></div>

                    <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 md:p-8 md:w-[35%] flex flex-col gap-4">

                        <div className="space-y-5">

                            <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-gray-800 uppercase bg-yellow-400/50 px-2 py-1 rounded">
                                Limited Edition
                            </span>

                            <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-none">
                                FRESH
                                <span className="text-pink-600 drop-shadow-sm">DROPS!</span>
                            </h1>

                            <p className="text-gray-700 text-md md:text-lg font-medium w-60 md:max-w-70 border-l-2 border-pink-500 pl-2 md:pl-4">
                                Style that speaks for you. Explore the latest trends.
                            </p>
                        </div>

                        {/* Stylish Button */}
                        <button className="mt-4 md:mt-6 bg-pink-500 text-white font-bold py-2 md:py-3.5 px-6 md:px-10 rounded-xl hover:bg-white hover:text-pink-600 transition-all duration-300 shadow-xl active:scale-95 w-fit cursor-pointer flex items-center gap-2">
                            Grab Now
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HomeNewProductBanner;