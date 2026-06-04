
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
import { useTranslation } from 'react-i18next';

function StockInventoryTable() {
    const { t } = useTranslation();
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

    if (isLoading) return <p className="p-10 text-center">{t('stockInventoryTable.loading')}</p>;
    if (isError) return <p className="p-10 text-center text-red-500">{t('stockInventoryTable.error')}</p>;

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
                        placeholder={t('stockInventoryTable.searchPlaceholder')}
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
                                <th className="px-6 py-4 whitespace-nowrap min-w-50 lg:min-w-0">{t('stockInventoryTable.thProduct')}</th>
                                <th className="px-6 py-4 whitespace-nowrap">{t('stockInventoryTable.thCategory')}</th>
                                <th className="px-6 py-4 whitespace-nowrap">{t('stockInventoryTable.thStock')}</th>
                                <th className="px-6 py-4 whitespace-nowrap">{t('stockInventoryTable.thApproved')}</th>
                                <th className="px-6 py-4 whitespace-nowrap">{t('stockInventoryTable.thPrice')}</th>
                                <th className="px-6 py-4 whitespace-nowrap text-center">{t('stockInventoryTable.thAction')}</th>
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
                                                    <span className="text-[10px] text-slate-400 font-medium">{t('stockInventoryTable.units')}</span>
                                                </div>
                                                <span className={`w-fit px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border transition-all
                                                ${getStockStatusStyle[product.stockStatus] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                    {product.stockStatus === 'Out of Stock' && t('stockInventoryTable.statusOutOfStock')}
                                                    {product.stockStatus === 'Critical' && t('stockInventoryTable.statusCritical')}
                                                    {product.stockStatus === 'Low Stock' && t('stockInventoryTable.statusLowStock')}
                                                    {product.stockStatus === 'Medium' && t('stockInventoryTable.statusMedium')}
                                                    {product.stockStatus === 'High Stock' && t('stockInventoryTable.statusHighStock')}
                                                    {!getStockStatusStyle[product.stockStatus] && product.stockStatus}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                                            ${product.status === 'Approved' ? "text-green-700" : product.status === 'Pending' ? "text-amber-700" : "text-red-700"}`}>
                                                {product.status === 'Approved' && t('stockInventoryTable.approvalApproved')}
                                                {product.status === 'Pending' && t('stockInventoryTable.approvalPending')}
                                                {product.status === 'Rejected' && t('stockInventoryTable.approvalRejected')}
                                                {!['Approved', 'Pending', 'Rejected'].includes(product.status) && product.status}
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
                                    <td colSpan="6" className="text-center py-10 text-slate-400 text-sm">
                                        {t('stockInventoryTable.noProductsFound')}
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
                            {t('stockInventoryTable.paginationPrev')}
                        </button>
                        {getPaginationRange(page, totalPages).map((num, idx) =>
                            num === '...'
                                ? <span key={`dot-${idx}`} className="px-2 py-1.5 text-xs text-slate-400">...</span>
                                : <button
                                    key={num}
                                    onClick={() => setPage(num)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                                        ${page === num ? 'bg-pink-500 text-white border-pink-500' : 'border-pink-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800'}`}
                                    style={{ contentVisibility: 'auto' }} >
                                    {num}
                                </button>
                        )}
                        <button
                            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-pink-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            {t('stockInventoryTable.paginationNext')}
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