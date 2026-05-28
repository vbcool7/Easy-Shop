
import React from 'react'
import NewProductBanner from '../assets/Images/NewProductBanner.jpg';
import { useGetBanners } from '../hook/useBanner';
import { Link } from 'react-router-dom';

function HomeNewProductBanner() {

    const { data: banners, isLoading } = useGetBanners('home_mid');
    const banner = banners?.[0];

    const imageUrl = banner?.image || NewProductBanner;
    const badge = banner?.badge || '';
    const headingMain = banner?.headingMain || 'New';
    const headingAccent = banner?.headingAccent || 'Products';
    const paragraph = banner?.paragraph || '';
    const offerText = banner?.offerText || '';
    const ctaText = banner?.ctaText || 'Shop Now';
    const ctaLink = banner?.ctaLink || '/all_products';

    if (isLoading) return (
        <section className="w-full px-4 lg:px-6">
            <div className="max-w-6xl mx-auto">
                <div className="w-full h-100 md:h-140 bg-gray-200 rounded-3xl animate-pulse" />
            </div>
        </section>
    );

    return (
        <section className="w-full md:py-10 px-4 lg:px-6">
            <div className="relative max-w-6xl mx-auto overflow-hidden rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">

                {/* Banner Wrapper */}
                <div className='w-full h-112.5 md:h-125 relative flex items-center'>

                    {/* Background Image */}
                    <img
                        src={imageUrl}
                        alt={headingMain || "Banner"}
                        className='absolute inset-0 w-full h-full object-cover select-none'
                    />

                    {/* Smart Responsive Overlay - Mobile par dark gradient taaki har image par text dikhe */}
                    <div className="absolute inset-0 bg-linear-to-r from-black/60 via-black/30 to-transparent md:bg-none"></div>

                    {/* Content Container with Glassmorphism Card */}
                    <div className="absolute left-4 sm:left-6 md:left-12 max-w-[90%] sm:max-w-[70%] md:max-w-[45%] lg:max-w-[40%] z-10">

                        <div className="p-5 md:p-8 rounded-2xl md:rounded-3xl 
                                        bg-black/20 md:bg-white/10 
                                        backdrop-blur-md md:backdrop-blur-xl 
                                        border border-white/10 md:border-white/20 
                                        shadow-2xl flex flex-col gap-3 md:gap-4 text-left">

                            {/* Badge */}
                            {badge && (
                                <span className="w-fit text-[10px] md:text-xs font-bold tracking-wider text-white uppercase bg-pink-500 px-2.5 py-1 rounded-md shadow-xs">
                                    {badge}
                                </span>
                            )}

                            {/* Dynamic Headings */}
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                                {headingMain} <span className="text-pink-400 block sm:inline">{headingAccent}</span>
                            </h1>

                            {/* Paragraph */}
                            {paragraph && (
                                <p className="text-gray-100 md:text-slate-900 text-xs sm:text-sm md:text-base font-medium line-clamp-3 md:line-clamp-none border-l-2 border-pink-400 pl-3">
                                    {paragraph}
                                </p>
                            )}

                            {/* Redirection Button */}
                            <Link
                                to={ctaLink}
                                className="mt-2 md:mt-4 bg-pink-500 text-white font-bold text-xs sm:text-sm py-2.5 md:py-3.5 px-6 md:px-8 rounded-xl hover:bg-white hover:text-pink-600 transition-all duration-300 shadow-lg hover:shadow-pink-500/20 active:scale-95 w-fit flex items-center justify-center gap-2 group"
                            >
                                {ctaText}
                                <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}

export default HomeNewProductBanner;