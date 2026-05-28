
import React from 'react'
import AllProdBanner from '../assets/Images/AllProdBanner.jpg';
import { useGetBanners } from '../hook/useBanner';
import { Link } from 'react-router-dom';

function ProductsBanner() {

    const { data: banners, isLoading } = useGetBanners('category_top');
    const banner = banners?.[0];

    const imageUrl = banner?.image || AllProdBanner;
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
        <section className='w-full px-4 lg:px-6 md:py-6'>
            <div className='max-w-6xl mx-auto h-80 md:h-110 relative overflow-hidden rounded-2xl md:rounded-3xl shadow-md border border-slate-100 dark:border-slate-800/50'>

                {/* Background Image */}
                <img
                    src={imageUrl}
                    alt="Products Banner"
                    className='w-full h-full object-cover select-none'
                />

                <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/40 to-black/60"></div>

                {/* Center Content Holder */}
                <div className='absolute inset-0 flex flex-col items-center justify-center px-4 md:px-8 text-center z-10'>

                    <div className="p-5 md:p-8 rounded-2xl bg-black/15 backdrop-blur-[3px] border border-white/10 max-w-3xl flex flex-col items-center gap-3 md:gap-4">

                        <h2 className='font-extrabold text-2xl md:text-[44px] text-white/90 tracking-tight leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] line-clamp-2 md:line-clamp-none'>
                            {paragraph}
                        </h2>

                    </div>

                </div>
            </div>
        </section>
    )
}

export default ProductsBanner;