
import { useNavigate } from 'react-router-dom';
import { useActiveSubCategories } from '../hook/useSubCategories';

function HomeProdGrid() {

    const navigate = useNavigate();
    const { data: subCategories, isLoading, isError } = useActiveSubCategories();
    const activeSubCats = subCategories || [];

    if (isLoading) return <p className="text-center py-10">Loading Collections...</p>;
    if (isError) return <p className="text-center py-10 text-red-500">Something went wrong!</p>;

    const handleNavigate = (item) => {
        if (!item?._id) return;
        navigate(`/all_products/${item.catId._id}/${item.catId.catName}?subCatId=${item._id}`);
    };

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

                    {/* 1. Big Vertical Box - Occupies 2 rows */}
                    <div
                        onClick={() => handleNavigate(activeSubCats[0])}
                        className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-3xl bg-gray-100 cursor-pointer">
                        {activeSubCats[0] && (
                            <img
                                src={activeSubCats[0].subCatImage}
                                alt={activeSubCats[0].subCatName}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300"></div>
                        <div className="absolute bottom-8 left-8 text-white">
                            <h3 className="text-3xl font-bold">{activeSubCats[0]?.subCatName}</h3>
                            <button className="mt-4 bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-pink-500 hover:text-white transition-colors">
                                Explore
                            </button>
                        </div>
                    </div>

                    {/* 2. Horizontal Wide Box */}
                    <div
                        onClick={() => handleNavigate(activeSubCats[1])}
                        className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-gray-100 h-64 md:h-auto cursor-pointer">
                        {activeSubCats[1] && (
                            <img
                                src={activeSubCats[1].subCatImage}
                                alt={activeSubCats[1].subCatName}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                            <h3 className="text-2xl font-bold">{activeSubCats[1]?.subCatName}</h3>
                            <span className="mt-1 block text-pink-400 font-bold border-pink-400 cursor-pointer">
                                Shop Now
                            </span>
                        </div>
                    </div>

                    {/* 3. Small Box */}
                    <div
                        onClick={() => handleNavigate(activeSubCats[2])}
                        className="relative group overflow-hidden rounded-3xl bg-gray-100 h-64 md:h-auto cursor-pointer">
                        {activeSubCats[2] && (
                            <img
                                src={activeSubCats[2].subCatImage}
                                alt={activeSubCats[2].subCatName}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        )}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-300"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                            <h3 className="text-xl font-bold">{activeSubCats[2]?.subCatName}</h3>
                            <p className="text-xs font-bold text-pink-400">Exclusive Styles</p>
                        </div>
                    </div>

                    {/* 4. Small Box */}
                    <div
                        onClick={() => handleNavigate(activeSubCats[3])}
                        className="relative group overflow-hidden rounded-3xl bg-gray-100 h-64 md:h-auto cursor-pointer">
                        {activeSubCats[3] && (
                            <img
                                src={activeSubCats[3].subCatImage}
                                alt={activeSubCats[3].subCatName}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        )}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-300"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                            <h3 className="text-xl font-bold">{activeSubCats[3]?.subCatName}</h3>
                            <p className="text-xs font-bold text-pink-400">Exclusive Styles</p>
                        </div>
                    </div>

                    {/* 5. Small Box */}
                    <div
                        onClick={() => handleNavigate(activeSubCats[4])}
                        className="relative group overflow-hidden rounded-3xl bg-gray-100 h-64 md:h-50 cursor-pointer">
                        {activeSubCats[4] && (
                            <img
                                src={activeSubCats[4].subCatImage}
                                alt={activeSubCats[4].subCatName}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        )}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-300"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                            <h3 className="text-xl font-bold">{activeSubCats[4]?.subCatName}</h3>
                            <p className="text-xs font-bold text-pink-400">Exclusive Styles</p>
                        </div>
                    </div>

                    {/* 6. Small Box */}
                    <div
                        onClick={() => handleNavigate(activeSubCats[5])}
                        className="relative group overflow-hidden rounded-3xl bg-gray-100 h-64 md:h-50 cursor-pointer">
                        {activeSubCats[5] && (
                            <img
                                src={activeSubCats[5].subCatImage}
                                alt={activeSubCats[5].subCatName}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        )}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-300"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                            <h3 className="text-xl font-bold">{activeSubCats[5]?.subCatName}</h3>
                            <p className="text-xs font-bold text-pink-400">Exclusive Styles</p>
                        </div>
                    </div>

                    {/* 7. Wide Box */}
                    <div
                        onClick={() => handleNavigate(activeSubCats[6])}
                        className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-gray-100 h-64 md:h-50 cursor-pointer">
                        {activeSubCats[6] && (
                            <img
                                src={activeSubCats[6].subCatImage}
                                alt={activeSubCats[6].subCatName}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        )}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all duration-300"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                            <h3 className="text-xl font-bold">{activeSubCats[6]?.subCatName}</h3>
                            <p className="text-xs font-bold text-pink-400">Exclusive Styles</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default HomeProdGrid;