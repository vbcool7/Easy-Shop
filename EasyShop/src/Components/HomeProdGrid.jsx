
import { useNavigate } from 'react-router-dom';

import { useSubCatList } from '../hook/useSubCategories';

function HomeProdGrid() {

    const navigate = useNavigate();

    const { data: subCategories, isLoading, isError } = useSubCatList();

    // only active sub categories filter
    const activeSubCats = subCategories?.filter(subCat => subCat.isActive) || [];

    // show itmes
    const bentoItems = activeSubCats.filter(item =>
        ['home-decor', 'sports-shoes', 'casual-shirts-t-shirts', 'skincare', 'mens-watches', 'professional-makeup', 'traditional-jewelry'].includes(item.slug)
    );

    const homeDecor = bentoItems.find(item => item.slug === 'home-decor');
    const shoes = bentoItems.find(item => item.slug === 'sports-shoes');
    const shirts = bentoItems.find(item => item.slug === 'casual-shirts-t-shirts');
    const skinCare = bentoItems.find(item => item.slug === 'skincare');
    const watches = bentoItems.find(item => item.slug === 'mens-watches');
    const makeup = bentoItems.find(item => item.slug === 'professional-makeup');
    const jewelry = bentoItems.find(item => item.slug === 'traditional-jewelry');

    if (isLoading) return <p className="text-center py-10">Loading Collections...</p>;
    if (isError) return <p className="text-center py-10 text-red-500">Something went wrong!</p>;

    return (
        <section className="w-full py-8 md:py-16 px-4 lg:px-6">
            <div className="max-w-6xl mx-auto">

                {/* heading */}
                <div className="flex flex-col items-center mb-8 md:mb-12">
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-800 tracking-tight">
                        Shop By Category
                    </h2>

                    <div className="w-20 h-1 md:h-1.5 bg-pink-500 rounded-full mt-2 md:mt-3"></div>

                    <p className="text-gray-500 mt-4 text-[12px] text-center md:text-sm uppercase tracking-widest">
                        Explore our diverse collections curated just for you
                    </p>
                </div>

                {/* The Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-4 grid-flow-row-dense gap-4 h-auto md:h-180">

                    {/* 1. Big Vertical Box (home decor) - Occupies 2 rows */}
                    <div
                        onClick={() => navigate(`/all_products/${homeDecor?.catId}/${homeDecor?.catName}?subCatId=${homeDecor?._id}`)}
                        className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-3xl bg-gray-100 cursor-pointer">
                        <img
                            src={homeDecor?.subCatImage}
                            alt={homeDecor?.subCatName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300"></div>
                        <div className="absolute bottom-8 left-8 text-white">
                            <h3 className="text-3xl text-[(#FFFFFF)] font-bold">
                                {homeDecor?.subCatName}
                            </h3>
                            <p className="text-sm opacity-90 mb-4 font-medium">
                                "Design your dream home"
                            </p>
                            <button className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-pink-500 hover:text-white transition-colors">
                                Explore
                            </button>
                        </div>
                    </div>

                    {/* 2. Horizontal Wide Box (skin care) */}
                    <div
                        onClick={() => navigate(`/all_products/${skinCare?.catId}/${skinCare?.catName}?subCatId=${skinCare?._id}`)}
                        className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-gray-100 h-64 md:h-auto cursor-pointer">
                        <img
                            src={skinCare?.subCatImage}
                            alt={skinCare?.subCatName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300"></div>
                        <div className="absolute top-1/2 -translate-y-1/2 left-8 text-white">
                            <h3 className="text-2xl font-bold">
                                {skinCare?.subCatName}
                            </h3>
                            <p className="text-sm opacity-90 mb-2 font-medium">
                                Glow Every Day
                            </p>
                            <span className="text-pink-400 font-bold border-b-2 border-pink-400 cursor-pointer">
                                Shop Now
                            </span>
                        </div>
                    </div>

                    {/* 3. Small Box (Shoes) */}
                    <div
                        onClick={() => navigate(`/all_products/${shoes?.catId}/${shoes?.catName}?subCatId=${shoes?._id}`)}
                        className="relative group overflow-hidden rounded-3xl bg-gray-100 h-64 md:h-auto cursor-pointer">
                        <img src={shoes?.subCatImage}
                            alt={shoes?.subCatName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-300"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                            <h3 className="text-xl text-white font-bold">
                                {shoes?.subCatName}
                            </h3>
                            <p className="text-xs font-bold text-pink-400">
                                Up to 40% Off
                            </p>
                        </div>
                    </div>

                    {/* 4. Small Box (shirt) */}
                    <div
                        onClick={() => navigate(`/all_products/${shirts?.catId}/${shirts?.catName}?subCatId=${shirts?._id}`)}
                        className="relative group overflow-hidden rounded-3xl bg-gray-100 h-64 md:h-auto cursor-pointer">
                        <img
                            src={shirts?.subCatImage}
                            alt={shirts?.subCatName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-300"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                            <h3 className="text-xl font-bold">
                                {shirts?.subCatName}
                            </h3>
                            <p className="text-xs font-bold text-pink-400">
                                Exclusive Styles
                            </p>
                        </div>
                    </div>

                    {/* 5. Small Box (jewelry) */}
                    <div
                        onClick={() => navigate(`/all_products/${jewelry?.catId}/${jewelry?.catName}?subCatId=${jewelry?._id}`)}
                        className="relative group overflow-hidden rounded-3xl bg-gray-100 h-64 md:h-50 cursor-pointer">
                        <img
                            src={jewelry?.subCatImage}
                            alt={jewelry?.subCatName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-300"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                            <h3 className="text-xl font-bold">
                                {jewelry?.subCatName}
                            </h3>
                            <p className="text-xs font-bold text-pink-400">Exclusive Styles</p>
                        </div>
                    </div>

                    {/* 6. Small Box (makeup) */}
                    <div
                        onClick={() => navigate(`/all_products/${makeup?.catId}/${makeup?.catName}?subCatId=${makeup?._id}`)}
                        className="relative group overflow-hidden rounded-3xl bg-gray-100 h-64 md:h-50 cursor-pointer">
                        <img
                            src={makeup?.subCatImage}
                            alt={makeup?.subCatName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-300"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                            <h3 className="text-xl font-bold text-white">
                                {makeup?.subCatName}
                            </h3>
                            <p className="text-xs font-bold text-pink-600">Exclusive Styles</p>
                        </div>
                    </div>

                    {/* 7. Small Box (watch) */}
                    <div
                        onClick={() => navigate(`/all_products/${watches?.catId}/${watches?.catName}?subCatId=${watches?._id}`)}
                        className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-gray-100 h-64 md:h-50 cursor-pointer">
                        <img
                            src={watches?.subCatImage}
                            alt={watches?.subCatName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-300"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                            <h3 className="text-xl font-bold text-white">
                                {watches?.subCatName}
                            </h3>
                            <p className="text-xs font-bold text-pink-400">Exclusive Styles</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HomeProdGrid;