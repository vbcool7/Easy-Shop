
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';

import { useBestSellerProducts } from '../hook/uesProducts';
import { useTranslation } from 'react-i18next';

function HomeBestSeller() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: bestSellerProds, isLoading } = useBestSellerProducts();

    if (isLoading) return <p>{t('home.loadingBestSellers')}</p>;

    // no products guard
    if (!bestSellerProds || bestSellerProds.length === 0) return null;

    return (
        <section className="w-full px-4 sm:px-5 lg:px-6 py-8 md:py-16">
            <div className="mx-auto max-w-6xl">

                {/* heading */}
                <div className="mb-8 flex flex-col items-center text-center md:mb-12">
                    <h2 className="max-w-88 wrap-break-words text-center text-2xl font-bold leading-tight tracking-tight text-gray-800 sm:max-w-xl md:max-w-3xl md:text-4xl">
                        {t('home.bestSeller')}
                    </h2>

                    <div className="mt-3 h-1 w-20 rounded-full bg-pink-500 md:h-1.5"></div>

                    <p className="mt-4 max-w-84 wrap-break-words text-center text-[11px] uppercase leading-relaxed tracking-widest text-gray-500 sm:max-w-2xl sm:text-xs md:text-sm">
                        {t('home.mostLoved')}
                    </p>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
                    {bestSellerProds.slice(0, 8).map((item, index) => (
                        <div
                            key={index}
                            onClick={() =>
                                navigate(`/product_detail/${item._id}/${item.prodName}`)
                            }
                            className="group min-w-0 cursor-pointer"
                        >
                            <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl bg-gray-100 sm:rounded-3xl">
                                {/* Hot Badge */}
                                <span className="absolute left-3 top-3 z-10 max-w-[70%] wrap-break-words rounded-full bg-orange-500 px-2 py-1 text-center text-[8px] font-bold leading-tight text-white shadow-lg sm:left-4 sm:top-4 md:px-3 md:text-[10px]">
                                    {t('home.hotSelling')}
                                </span>

                                <img
                                    src={item.prodImage}
                                    alt={item.prodName}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* shop btn */}
                                <div className="absolute inset-x-0 bottom-2 px-3 translate-y-0 transition-transform duration-300 md:translate-y-16 md:px-4 md:group-hover:translate-y-0">
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
                                                },
                                            });
                                        }}
                                        className="flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-white/90 px-3 py-2 text-center text-xs font-bold leading-tight text-gray-900 shadow-xl backdrop-blur-md transition-all hover:bg-pink-500 hover:text-white sm:text-sm"
                                    >
                                        <span className="min-w-0 wrap-break-words">
                                            {t('home.viewShop')}
                                        </span>
                                        <span className="shrink-0 px-2 text-xl sm:text-2xl">→</span>
                                    </button>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="min-w-0 space-y-1 px-2 text-center sm:text-left">
                                <p className="wrap-break-words text-sm font-serif leading-snug text-gray-500">
                                    {item.prodName}
                                </p>

                                <span className="inline-flex flex-wrap items-baseline justify-center gap-x-1 text-lg font-black text-pink-500 transition-colors group-hover:text-gray-900 sm:justify-start">
                                    <span className="text-sm font-medium text-gray-500">
                                        {t('home.under')}
                                    </span>
                                    <span className="text-sm font-bold">₹</span>
                                    {item.price}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default HomeBestSeller;