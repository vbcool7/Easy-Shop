
import React, { useState } from 'react';
import { HiOutlineArrowNarrowRight, HiOutlineExclamationCircle } from "react-icons/hi";

import { useStockAlert, useTopSellingProducts } from '../../hook/uesProducts';
import UpdateProductDrawer from './UpdateProductDrawer';

const lowStock = [
    { name: "Cotton T-Shirt", left: 3, status: "Critical" },
    { name: "Leather Wallet", left: 8, status: "Low" },
    { name: "Denim Jacket", left: 5, status: "Critical" },
];

const AnalyticsSplit = ({ setCurrentPage }) => {

    const { data: topSellingProducts, isLoading, isError } = useTopSellingProducts();
    const { data: stockAlert } = useStockAlert();

    const [isEditOpen, setIsEditOpen] = useState(false);

    if (isLoading) return <p className="p-10 text-center animate-pulse">Fetching products...</p>;
    if (isError) return <p className="p-10 text-center text-red-500">Error loading products...</p>;

    // --------Edit--------
    const handleEditProduct = (product) => {
        setIsEditOpen(product)
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-8">

            {/* Left Side: Top Selling Products (Occupies 2 columns on large screens) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-pink-50 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">

                    <h2 className="text-sm md:text-lg font-bold text-slate-800 dark:text-white">
                        Top Selling Products
                    </h2>
                    <button
                        onClick={() => setCurrentPage("All Products")}
                        className="text-pink-500 text-xs md:text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all cursor-pointer">
                        See All <HiOutlineArrowNarrowRight />
                    </button>
                </div>

                <div className="space-y-4">
                    {topSellingProducts.map((product, i) => (
                        <div
                            key={product._id}
                            className="flex items-center justify-between p-3 rounded-2xl hover:bg-pink-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <img
                                    src={product.prodImage}
                                    alt={product.prodName}
                                    className="w-12 h-12 rounded-xl object-cover border border-pink-100" />
                                <div>
                                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {product.prodName}
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        {product.totalSold} Sales
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-800 dark:text-white">
                                    ₹{product.price.toLocaleString('en-IN')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Side: Low Stock Alerts (Occupies 1 column) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-pink-50 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <HiOutlineExclamationCircle className="text-rose-500 w-6 h-6" />
                    <h2 className="text-sm md:text-lg font-bold text-slate-800 dark:text-white">
                        Stock Alerts
                    </h2>
                </div>

                <div className="space-y-4">
                    {stockAlert?.map((product, i) => (
                        <div
                            key={product._id}
                            className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100/50">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {product.prodName}
                                </h3>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-center
                                    ${product.stockStatus === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-orange-600'}`}>
                                    {product.stockStatus}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <p className="text-xs text-rose-600 font-medium">
                                    Only {product.stock} units left
                                </p>

                                <button
                                    onClick={() => handleEditProduct(product)}
                                    className="text-[10px] font-bold text-slate-500 underline uppercase tracking-tighter">
                                    Restock Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* edit drawer */}
            <UpdateProductDrawer
                product={isEditOpen}
                isOpen={!!isEditOpen}
                onClose={() => setIsEditOpen(null)}
            />

        </div>
    );
};

export default AnalyticsSplit;