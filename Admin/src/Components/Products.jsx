
import React, { useState } from 'react';
import { useEffect } from 'react';
import { TbEdit } from "react-icons/tb";
import { LiaTrashSolid } from "react-icons/lia";
import { HiOutlineExclamation, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

import { useDeleteProduct, useGetProductDeleteInfo, useGetProducts, useToggleBestSeller, useToggleProductArrival, useUpdateProductStatus } from '../hooks/useProducts';
import EditProductDrawer from './EditProductDrawer';
import { useAdminUIStore } from '../store/useAdminAuthStore';
import { getPaginationRange } from '../utils/getPaginationRange';
import { useTranslation } from 'react-i18next';

function Products() {

    const {t} = useTranslation();
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);

    // debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isError } = useGetProducts({ search: debouncedSearch, page });
    const allProds = data?.data;
    const totalPages = data?.totalPages;

    const { mutate: toggleStatus, isPending: isUpdating } = useUpdateProductStatus();
    const { mutate: toggleBestSeller, isPending: isTogglingBestSeller } = useToggleBestSeller();
    const { mutate: toggleArrival, isPending: isToggling } = useToggleProductArrival();
    const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

    const { selectedProductSearch, isProductDrawerOpen, closeProductDrawer, openProductDrawer } = useAdminUIStore();
    const [selectedProdId, setSelectedProdId] = useState(null);
    const [isDeletedOpen, setIsDeletedOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState("");

    const { data: deleteInfo, isLoading: isInfoLoading } = useGetProductDeleteInfo(selectedProdId);

    // status toggle
    const statusStyles = {
        Approved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        Pending: 'bg-amber-50  text-amber-600  border-amber-200',
        Rejected: 'bg-rose-50   text-rose-600   border-rose-200',
    };

    // stock status
    const stockStyles = {
        'Out of Stock': 'bg-slate-100  text-slate-500  border-slate-200',
        'Critical': 'bg-red-50     text-red-600     border-red-200',
        'Low Stock': 'bg-orange-50  text-orange-500  border-orange-200',
        'Medium': 'bg-amber-50   text-amber-500   border-amber-200',
        'High Stock': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    };

    // toggle arrival
    const handleToggleArrival = (productId) => {
        toggleArrival({ product_id: productId })
    }

    // toggle best Seller
    const handleToggleBestSeller = (productId) => {
        toggleBestSeller(productId);
    };

    // delete
    const handleDeleteClick = (product) => {
        setSelectedProduct(product);
        setSelectedProdId(product._id)
        setIsDeletedOpen(true);
    }

    const handleDeleteProduct = () => {
        deleteProduct({ prod_id: selectedProduct._id }, {
            onSuccess: () => {
                setIsDeletedOpen(false);
                setSelectedProduct(null);
                setSelectedProdId(null);
            }
        });
    }

    if (isLoading) return <p className="p-10 text-center">{t('adminProducts.loading')}</p>;
    if (isError) return <p className="p-10 text-center text-red-500">{t('adminProducts.error')}</p>;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-3xl border border-pink-50 dark:border-slate-800 shadow-sm overflow-hidden">

            {/* Heading with Search & Add Button */}
            <div className="p-4 md:p-6 border-b border-pink-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                {/* Title */}
                <div>
                    <div className='flex gap-2 items-center'>
                        <h2 className="text-md md:text-lg font-bold text-slate-800 dark:text-white shrink-0">
                            {t('adminProducts.title')}
                        </h2>

                        <span className="hidden lg:flex bg-pink-100 text-pink-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {t('adminProducts.totalBadge')} {data?.count || 0}
                        </span>
                    </div>
                    <p className="text-[11px] md:text-xs text-slate-500 mt-1">
                        {t('adminProducts.description')}
                    </p>
                </div>

                {/* Search */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('adminProducts.searchPlaceholder')}
                        className="w-full sm:w-64 text-sm px-2 md:px-4 py-2 md:py-2.5 rounded-xl border border-pink-50 bg-slate-50 dark:bg-slate-800 focus:outline-pink-400 focus:bg-white transition-all shadow-sm placeholder:text-xs md:placeholder:text-[13px]"
                    />
                </div>
            </div>

            {/* table */}
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">

                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 whitespace-nowrap">{t('adminProducts.colImage')}</th>
                            <th className="px-6 py-4 whitespace-nowrap min-w-50 lg:min-w-0">{t('adminProducts.colProduct')}</th>
                            <th className="px-6 py-4 whitespace-nowrap">{t('adminProducts.colCategory')}</th>
                            <th className="px-6 py-4 whitespace-nowrap">{t('adminProducts.colVendorInfo')}</th>
                            <th className="px-6 py-4 whitespace-nowrap">{t('adminProducts.colPriceStock')}</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">{t('adminProducts.colStockStatus')}</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">{t('adminProducts.colStatus')}</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">{t('adminProducts.colNewArrival')}</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">{t('adminProducts.colBestSeller')}</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">{t('adminProducts.colAction')}</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-pink-50 dark:divide-slate-800">
                        {allProds.length > 0 ? allProds?.map((product, index) => {

                            return (
                                <tr
                                    key={index}
                                    className="hover:bg-pink-50/30 dark:hover:bg-slate-800/30 transition-colors group">

                                    {/* Image Column */}
                                    <td className="px-6 py-4">
                                        <div className="relative w-12 h-12 shrink-0">
                                            <img
                                                src={product.prodImage}
                                                alt={product.prodName}
                                                className="w-12 h-12 rounded-xl object-cover border border-pink-100 shadow-sm" />
                                        </div>
                                    </td>

                                    {/* Product Name Column */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 line-clamp-1">
                                                {product.prodName}
                                            </span>
                                            {/* Mobile par Sub-Category dikhane ke liye */}
                                            <span className="text-[10px] text-pink-500 font-medium sm:hidden">
                                                {product?.subCatId?.subCatName || "---"}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Category & Sub-Category Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                {product?.subCatId?.subCatName || "---"}
                                            </span>
                                            <span className="text-[10px] text-slate-400 italic">
                                                {product?.catId?.catName || '---'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* vendor info */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center shrink-0">
                                                <span className="text-[10px] font-black text-pink-500">
                                                    {product?.vendorId?.storeName?.charAt(0) || 'V'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    {product?.vendorId?.storeName || product?.vendorId?.name || '---'}
                                                </span>
                                                <span className="text-[10px] text-slate-400">
                                                    {product?.vendorId?._id?.slice(-6).toUpperCase() || '---'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Price & Quantity Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-pink-600">
                                                {product.price}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {t('adminProducts.stockLabel')} {product.stock}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Stock Status Badge */}
                                    <td className="px-4 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border
                                        ${stockStyles[product.stockStatus] || 'bg-slate-50 text-slate-400'}`}>
                                            {product.stockStatus || '---'}
                                        </span>
                                    </td>

                                    {/* status */}
                                    <td className="px-6 py-4 text-center">
                                        <select
                                            value={product.status || 'pending'}
                                            disabled={isUpdating}
                                            onChange={(e) => toggleStatus({ product_id: product._id, status: e.target.value })}
                                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border cursor-pointer outline-none transition-all
                                        ${statusStyles[product.status] || statusStyles.pending}`}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </td>

                                    {/* New arival */}
                                    <td className="px-6 py-4 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={product.isNewArrival}
                                                disabled={isToggling}
                                                onChange={() => handleToggleArrival(product._id)}
                                            />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer 
                                               peer-checked:after:translate-x-full peer-checked:after:border-white 
                                               after:content-[''] after:absolute after:top-0.5 after:left-0.5 
                                               after:bg-white after:border-gray-300 after:border after:rounded-full 
                                               after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500">
                                            </div>
                                        </label>
                                    </td>

                                    {/* best seller */}
                                    <td className="px-6 py-4 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={product.isBestSeller}
                                                disabled={isTogglingBestSeller}
                                                onChange={() => handleToggleBestSeller(product._id)}
                                            />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer 
                                            peer-checked:after:translate-x-full peer-checked:after:border-white 
                                            after:content-[''] after:absolute after:top-0.5 after:left-0.5 
                                          after:bg-white after:border-gray-300 after:border after:rounded-full 
                                            after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500">
                                            </div>
                                        </label>
                                    </td>

                                    {/* Action Buttons */}
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center items-center gap-2">
                                            <button
                                                onClick={() => openProductDrawer(product)}
                                                className="p-2 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition-all active:scale-90 cursor-pointer">
                                                <TbEdit className="text-lg md:text-xl" />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteClick(product)}
                                                disabled={isDeleting}
                                                className={`p-2 rounded-lg transition-all 
                                                     ${isDeleting
                                                        ? "bg-red-50/50 text-red-300 cursor-not-allowed opacity-70" // Delete ke time light color
                                                        : "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white active:scale-90 cursor-pointer" // Normal color
                                                    }`}
                                            >
                                                <LiaTrashSolid className={`text-lg md:text-xl ${isDeleting ? "animate-pulse" : ""}`} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-slate-400 text-sm">
                                    {t('adminProducts.emptySearch')}
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
                        {t('adminProducts.prev')}
                    </button>

                    {getPaginationRange(page, totalPages).map((num, idx) =>
                        num === '...'
                            ? <span key={`dot-${idx}`} className="px-2 py-1.5 text-xs text-slate-400">...</span>
                            : <button
                                key={num}
                                onClick={() => setPage(num)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                        ${page === num
                                        ? 'bg-pink-500 text-white border-pink-500'
                                        : 'border-pink-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {num}
                            </button>
                    )}

                    <button
                        onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-pink-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        {t('adminProducts.next')}
                    </button>
                </div>
            )}

            {/* edit product drawer */}
            <EditProductDrawer
                product={selectedProductSearch}
                isOpen={isProductDrawerOpen}
                onClose={closeProductDrawer}
            />

            {/* delete product popup */}
            <div
                className={`fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-100 px-4 transition-all duration-300 
                ${isDeletedOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
            >
                <div
                    onClick={() => { setIsDeletedOpen(false); setSelectedProdId(null); }}
                    className="absolute inset-0"
                ></div>

                <div
                    onClick={(e) => e.stopPropagation()}
                    className={`relative transform transition-all duration-300 rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-2xl w-full max-w-md border border-pink-50 dark:border-slate-800
                    ${isDeletedOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
                >
                    <button
                        onClick={() => { setIsDeletedOpen(false); setSelectedProdId(null); }}
                        className="absolute top-6 right-6 text-slate-400 hover:text-pink-500 transition-colors"
                    >
                        <HiOutlineX size={20} />
                    </button>

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 mb-6">
                        <HiOutlineExclamation className="h-8 w-8 text-red-500" />
                    </div>

                    <div className="text-center">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                            {t('adminProducts.deleteTitle')}
                        </h3>
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                            {isInfoLoading ? t('adminProducts.deleteChecking') : deleteInfo?.message}</p>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => { if (!isDeleting) { setIsDeletedOpen(false); setSelectedProdId(null); } }}
                            disabled={isDeleting}
                            className="w-full justify-center rounded-2xl bg-white px-3 py-3.5 text-sm font-bold text-slate-600 border border-slate-100 hover:bg-slate-50 transition-all sm:w-1/2 active:scale-95"
                        >
                            {t('adminProducts.deleteKeep')}
                        </button>

                        {deleteInfo?.canDelete && (
                            <button
                                type="button"
                                onClick={handleDeleteProduct}
                                disabled={isDeleting}
                                className="w-full justify-center rounded-2xl bg-linear-to-br from-red-500 to-red-600 px-3 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-100 hover:from-red-600 hover:to-red-700 transition-all sm:w-1/2 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? (
                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                ) : (
                                    <HiOutlineTrash size={18} />
                                )}
                                {isDeleting ? t('adminProducts.deleteDeleting') : t('adminProducts.deleteConfirm')}
                            </button>
                        )}
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Products;