
import { useNavigate, useSearchParams } from "react-router-dom";
import EasyShopLoader from "./EasyShopLoader";
import { AiFillStar } from "react-icons/ai";
import { useSearchResults } from "../hook/uesProducts";

function SearchResults() {

    const [searchParams] = useSearchParams();
    const query = searchParams.get('query') || "";
    const navigate = useNavigate();

    const { data: results, isLoading } = useSearchResults(query);

    if (isLoading) return <EasyShopLoader />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 min-h-[80vh]">

            {/* Header section */}
            {results && results.length > 0 && (
                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">
                    Results for <span className="text-pink-500">"{query}"</span>
                    <span className="text-gray-400 text-sm font-normal ml-2">
                        ({results.length} {results.length === 1 ? 'product' : 'products'} found)
                    </span>
                </h2>
            )}

            {/* Main Logic: Found vs Not Found */}
            {!results || results.length === 0 ? (
                <div className="min-h-[50vh] flex flex-col items-center justify-center text-center py-10">
                    <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center text-5xl mb-6 text-pink-500">
                        🔍
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 mb-2">
                        No results for "{query}"
                    </h3>
                    <p className="text-gray-400 text-sm max-w-sm mb-8 leading-relaxed">
                        Try different keywords, check the spelling, or browse our latest collection.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                        >
                            Go Back
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-bold hover:bg-pink-600 active:scale-95 transition-all shadow-md shadow-pink-100 cursor-pointer"
                        >
                            Browse All Products
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {results.map((product) => (
                        <div
                            key={product._id}
                            onClick={() => navigate(`/product_detail/${product._id}/${product.prodName}`)}
                            className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                        >
                            <div className="relative overflow-hidden rounded-xl bg-gray-50 aspect-square mb-3">
                                <img
                                    src={product.prodImage}
                                    alt={product.prodName}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            <div className="flex flex-col flex-1 justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-pink-500 transition-colors uppercase tracking-tight">
                                        {product.prodName}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                        {product.description || "Bring elegance to your wardrobe with this beautiful collection."}
                                    </p>
                                </div>

                                <div className="mt-3">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-sm font-black text-pink-500">₹{product.price}</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                        <div className="flex text-yellow-400 gap-0.5">
                                            <AiFillStar />
                                            <AiFillStar />
                                            <AiFillStar />
                                            <AiFillStar />
                                            <span className="text-gray-200"><AiFillStar /></span>
                                        </div>
                                        <span>(0)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchResults;