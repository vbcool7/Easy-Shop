
import React, { useEffect, useState } from 'react';
import { TbEdit } from "react-icons/tb";
import { LiaTrashSolid } from "react-icons/lia";
import { HiOutlineSearch } from "react-icons/hi";
import { HiOutlineAdjustments } from "react-icons/hi";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { HiOutlineExclamation, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import { useProductList } from '../../hook/uesProducts';
import UpdateProductDrawer from './UpdateProductDrawer';
import { getPaginationRange } from '../../utils/getPaginationRange';

function StockInventoryTable() {

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isError } = useProductList({ search: debouncedSearch, page });
    const productList = data?.data || [];
    const totalPages = data?.totalPages || 1;

    const getStockStatusStyle = {
        'Out of Stock': 'text-slate-500  border-slate-200',
        'Critical': 'text-red-600     border-red-200',
        'Low Stock': 'text-orange-500  border-orange-200',
        'Medium': 'text-amber-500   border-amber-200',
        'High Stock': 'text-emerald-600 border-emerald-200',
    };

    const handleEditProduct = (product) => setIsEditOpen(product);

    if (isLoading) return <p className="p-10 text-center">Loading products...</p>;
    if (isError) return <p className="p-10 text-center text-red-500">Error fetching products!</p>;

    return (
        <div>
            {/* Search Container */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 px-4 py-6 md:p-6 bg-white dark:bg-slate-900 rounded-t-xl md:rounded-t-3xl">
                <div className="relative w-full lg:w-80 group">
                    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search product..."
                        className="w-full pl-11 pr-4 py-2 md:py-2.5 bg-slate-50 border border-pink-50 dark:bg-slate-800 focus:border-pink-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm outline-none transition-all shadow-sm placeholder:text-xs md:placeholder:text-[13px]"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-b-xl md:rounded-b-3xl border border-pink-50/50 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap min-w-50 lg:min-w-0">Product</th>
                                <th className="px-6 py-4 whitespace-nowrap">Category</th>
                                <th className="px-6 py-4 whitespace-nowrap">Stock</th>
                                <th className="px-6 py-4 whitespace-nowrap">Approved?</th>
                                <th className="px-6 py-4 whitespace-nowrap">Price</th>
                                <th className="px-6 py-4 whitespace-nowrap text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-pink-50 dark:divide-slate-800">
                            {productList.length > 0 ? productList.map((product, index) => {
                                return (
                                    <tr key={index} className="hover:bg-pink-50/30 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={product.prodImage} alt={product.prodName} className="w-12 h-12 rounded-xl object-cover border border-pink-100 shadow-sm" />
                                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-pink-600 transition-colors">
                                                    {product.prodName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{product?.subCatId?.subCatName || "---"}</span>
                                                <span className="text-[10px] text-slate-400 italic">{product?.catId?.catName || '---'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{product.stock}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">units</span>
                                                </div>
                                                <span className={`w-fit px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-all
                                                ${getStockStatusStyle[product.stockStatus] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                    {product.stockStatus}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                                            ${product.status === 'Approved' ? "text-green-700" : product.status === 'Pending' ? "text-amber-700" : "text-red-700"}`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-pink-600 dark:text-white">
                                            ₹{product.price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center items-center gap-2">
                                                <button onClick={() => handleEditProduct(product)} className="p-2 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition-all active:scale-90 cursor-pointer">
                                                    <TbEdit className="text-lg md:text-xl" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-10 text-slate-400 text-sm">
                                        No product inventory found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 py-4 px-6 border-t border-pink-50 dark:border-slate-800">
                        <button
                            onClick={() => setPage(p => Math.max(p - 1, 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-pink-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Prev
                        </button>
                        {getPaginationRange(page, totalPages).map((num, idx) =>
                            num === '...'
                                ? <span key={`dot-${idx}`} className="px-2 py-1.5 text-xs text-slate-400">...</span>
                                : <button
                                    key={num}
                                    onClick={() => setPage(num)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                                        ${page === num ? 'bg-pink-500 text-white border-pink-500' : 'border-pink-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800'}`}
                                >
                                    {num}
                                </button>
                        )}
                        <button
                            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-pink-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            <UpdateProductDrawer
                product={isEditOpen}
                isOpen={!!isEditOpen}
                onClose={() => setIsEditOpen(null)}
            />
        </div>
    );
}

export default StockInventoryTable;