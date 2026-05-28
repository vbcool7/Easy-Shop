
import React from 'react';
import HomeBannerImg2 from '../assets/Images/HomeBannerImg2.jpg';
import { Link } from 'react-router-dom';
import { useGetBanners } from '../hook/useBanner';

function HomeBanner() {

    const { data: banners, isLoading } = useGetBanners('home_hero');
    const banner = banners?.[0];

    const imageUrl = banner?.image || HomeBannerImg2;
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
        <section className="w-full px-4 lg:px-6">
            <div className="max-w-6xl mx-auto">

                {/* relative goes HERE — direct parent of absolute child */}
                <div className='relative w-full h-100 md:h-140'>
                    <img
                        src={imageUrl}
                        alt="HomeBanner"
                        className='w-full h-full object-cover rounded-3xl'
                    />

                    <div className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 p-4 md:p-8 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/30 w-[75%] md:w-[60%] lg:w-[40%] shadow-2xl flex flex-col md:gap-4">

                        {badge && (
                            <span className="bg-pink-500 text-white text-[6px] md:text-[10px] font-bold px-2 md:px-3 py-1 rounded-full w-fit tracking-widest uppercase">
                                {badge}
                            </span>
                        )}

                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                                {headingMain}{' '}
                                <span className="text-pink-500">{headingAccent}</span>
                            </h1>
                            {paragraph && (
                                <p className="text-white text-md md:text-lg font-medium">
                                    {paragraph}
                                </p>
                            )}
                        </div>

                        {offerText && (
                            <p className="text-white text-2xl md:text-3xl font-bold mt-2">
                                {offerText}
                            </p>
                        )}

                        <Link
                            to={ctaLink}
                            className="mt-4 hover:bg-white hover:text-pink-500 font-bold py-2 px-2 md:py-3 md:px-8 rounded-xl bg-pink-500 text-white text-sm md:text-md transition-all duration-300 shadow-lg active:scale-95 w-fit"
                        >
                            {ctaText}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HomeBanner;