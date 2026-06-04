
import React, { useEffect, useState } from 'react'

import { useCatList } from '../hook/useCategories';
import { useSubCatByCategory } from '../hook/useSubCategories';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

function HomeCategoryExplore() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(null);

    const { data: catList, isLoading: isCatLoading, isError } = useCatList();
    const { data: subCatList, isLoading: isSubLoading } = useSubCatByCategory(activeIndex);

    const curatedTabs = catList?.filter(item =>
        ['mens-wear', 'womens-wear', 'kids-wear'].includes(item.slug)
    ) || [];

    // default tab set
    useEffect(() => {
        if (curatedTabs.length > 0 && !activeIndex) {
            const defaultTab = curatedTabs.find(c => c.slug === 'womens-wear') || curatedTabs[0];
            setActiveIndex(defaultTab._id);
        }
    }, [curatedTabs, activeIndex]);

    if (isError) return <p className="text-center py-10 text-red-500">{t('home.somethingWrong')}</p>;

    return (
        <section className="w-full px-4 sm:px-5 lg:px-6 py-8 md:py-16">
            <div className="mx-auto max-w-6xl">

                {/* heading */}
                <div className="mb-8 flex flex-col items-center text-center md:mb-12">
                    <h2 className="max-w-88 wrap-break-words text-center text-2xl font-bold leading-tight tracking-tight text-gray-800 sm:max-w-xl md:max-w-3xl md:text-4xl">
                        {t('home.curatedCollections')}
                    </h2>

                    <div className="mt-3 h-1 w-20 rounded-full bg-pink-500 md:h-1.5"></div>

                    <p className="mt-4 max-w-84 wrap-break-words text-center text-[11px] uppercase leading-relaxed tracking-widest text-gray-500 sm:max-w-2xl sm:text-xs md:text-sm">
                        {t('home.handpickedFashion')}
                    </p>
                </div>

                {/* mobile tabs */}
                <div className="mb-8 flex w-full gap-2 overflow-x-auto pb-2 md:hidden">
                    {curatedTabs.map((cat) => (
                        <button
                            key={cat._id}
                            onClick={() => setActiveIndex(cat._id)}
                            className={`min-h-10 shrink-0 rounded-lg border border-gray-200 px-4 py-2 text-center text-xs font-semibold leading-tight shadow-sm transition-all duration-300 sm:text-sm ${activeIndex === cat._id
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-white text-pink-500'
                                }`}
                        >
                            <span className="block max-w-36 wrap-break-words">
                                {cat.catName}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex min-w-0 gap-4 md:gap-8">

                    {/* left side - tabs */}
                    <div className="hidden w-[25%] min-w-0 flex-col border-r border-gray-100 bg-pink-100 shadow-md md:flex">
                        {curatedTabs.length > 0 ? (
                            curatedTabs.map((cat) => (
                                <div
                                    key={cat._id}
                                    onClick={() => setActiveIndex(cat._id)}
                                    className={`relative cursor-pointer px-5 py-5 transition-all duration-300 lg:px-8 ${activeIndex === cat._id
                                            ? 'bg-white font-bold text-pink-600'
                                            : 'text-gray-500 hover:bg-pink-100'
                                        }`}
                                >
                                    {activeIndex === cat._id && (
                                        <div className="absolute left-0 top-0 h-full w-1.5 bg-pink-500"></div>
                                    )}

                                    <span className="block min-w-0 wrap-break-words text-sm font-semibold uppercase leading-snug tracking-wide">
                                        {cat.catName}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="wrap-break-words p-4 text-center text-xs text-gray-400">
                                {t('home.loadingTabs')}
                            </p>
                        )}
                    </div>

                    {/* right side - catalogue */}
                    <div className="min-w-0 w-full md:w-[75%]">
                        {isSubLoading ? (
                            <div className="flex items-center justify-center py-20 text-center">
                                <p className="animate-pulse wrap-break-words font-medium text-pink-500">
                                    {t('home.loadingCollection')}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-8 px-0 py-2 sm:gap-6 sm:p-4 md:grid-cols-3 md:p-6 lg:grid-cols-4">
                                {subCatList && subCatList.length > 0 ? (
                                    subCatList.map((subCat) => (
                                        <div
                                            key={subCat._id}
                                            onClick={() =>
                                                navigate(
                                                    `/all_products/${subCat?.catId?._id}/${subCat?.catId?.catName}?subCatId=${subCat?._id}`
                                                )
                                            }
                                            className="group flex min-w-0 cursor-pointer flex-col items-center text-center"
                                        >
                                            <div className="relative aspect-square w-28 overflow-hidden rounded-full bg-gray-50 shadow-md ring-pink-100 transition-all duration-300 group-hover:ring-4 sm:w-32 md:w-36 lg:w-40">
                                                <img
                                                    src={subCat.subCatImage}
                                                    alt={subCat.subCatName}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            </div>

                                            <div className="mt-4 flex min-h-12 w-full max-w-40 flex-col items-center text-center">
                                                <span className="max-w-full wrap-break-words text-center text-sm font-bold leading-snug text-gray-700 transition-colors group-hover:text-pink-600 md:text-base">
                                                    {subCat.subCatName}
                                                </span>

                                                <div className="mt-1 h-0.5 w-0 bg-pink-500 transition-all duration-300 group-hover:w-full"></div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center text-gray-400">
                                        <span className="wrap-break-words">
                                            {t('home.noSubCategories')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HomeCategoryExplore;