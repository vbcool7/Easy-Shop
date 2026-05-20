
import React, { useState } from 'react';
import { TbEdit } from "react-icons/tb";
import { LiaTrashSolid } from "react-icons/lia";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { HiOutlineExclamation, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

import { useProductList, useToggleProductStatus } from '../../hook/uesProducts';
import UpdateProductDrawer from './UpdateProductDrawer';

function AllProducts({ setCurrentPage }) {

    const { data: productList, isLoading, isError } = useProductList();
    const { mutate: toggleStatus, isPending, variables } = useToggleProductStatus();

    const [isEditOpen, setIsEditOpen] = useState(false);

    // stock status
    const stockStyles = {
        'Out of Stock': 'bg-slate-100  text-slate-500  border-slate-200',
        'Critical': 'bg-red-50     text-red-600     border-red-200',
        'Low Stock': 'bg-orange-50  text-orange-500  border-orange-200',
        'Medium': 'bg-amber-50   text-amber-500   border-amber-200',
        'High Stock': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    };

    // --------Toggle--------
    const handleToggleStatus = (product) => {
        toggleStatus(product);
    };

    // --------Edit--------
    const handleEditProduct = (product) => {
        setIsEditOpen(product)
    };

    if (isLoading) return <p className="p-10 text-center">Loading products...</p>;
    if (isError) return <p className="p-10 text-center text-red-500">Error fetching products!</p>;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-3xl border border-pink-50 dark:border-slate-800 shadow-sm overflow-hidden">

            {/* Heading with Search & Add Button */}
            <div className="p-4 md:p-6 border-b border-pink-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                {/* Title */}
                <div>
                    <div className='flex gap-2 items-center'>
                        <h2 className="text-md md:text-lg font-bold text-slate-800 dark:text-white shrink-0">
                            Products Hub
                        </h2>
                        <span className="hidden lg:flex bg-pink-100 text-pink-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {productList?.length || 0}
                        </span>
                    </div>

                    <p className="text-[11px] md:text-xs text-slate-500 mt-1">
                        Manage and organize your products
                    </p>
                </div>

                {/* Search & Button Group */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full sm:w-64 text-sm px-2 md:px-4 py-2 md:py-2.5 rounded-xl border border-pink-50 bg-slate-50 dark:bg-slate-800 focus:outline-pink-400 focus:bg-white transition-all shadow-sm placeholder:text-xs md:placeholder:text-[13px]"
                    />

                    {/* Add Button */}
                    <button
                        onClick={() => setCurrentPage('Add Product')}
                        className="w-full sm:w-auto bg-linear-to-br from-pink-500 to-pink-600 text-white px-2 md:px-5 py-2 md:py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-pink-200 transition-all active:scale-95 shrink-0 cursor-pointer">
                        + Add New
                    </button>
                </div>
            </div>

            {/* table */}
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4 whitespace-nowrap">Image</th>
                            <th className="px-6 py-4 whitespace-nowrap min-w-50 lg:min-w-0">Product</th>
                            <th className="px-6 py-4 whitespace-nowrap">Category</th>
                            <th className="px-6 py-4 whitespace-nowrap">Price & Qty</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">Stock Status</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">Approved?</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">Status</th>
                            <th className="px-6 py-4 whitespace-nowrap text-center">Action</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-pink-50 dark:divide-slate-800">
                        {productList.map((product, index) => {

                            const isThisRowLoading = isPending && variables === product._id;

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
                                                {product?.subCatId?.subCatName}
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

                                    {/* Price & Quantity Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-pink-600">
                                                {product.price}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                Stock: {product.stock}
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

                                    {/* approved */}
                                    <td className="px-4 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium
                                         ${product.status === 'Approved'
                                                ? " text-green-700 "
                                                : product.status === 'Pending'
                                                    ? " text-amber-700 "
                                                    : " text-red-700 "
                                            }`}>

                                            {product.status}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => !isPending && handleToggleStatus(product._id)}
                                            disabled={isPending}
                                            className={`w-16 inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold uppercase border transition-all
                                               ${isThisRowLoading ? 'opacity-50' : 'cursor-pointer'}
                                                 ${product.isActive
                                                    ? 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'
                                                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                                }`}
                                        >
                                            {isThisRowLoading ? (
                                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                product.isActive ? "Active" : "Inactive"
                                            )}
                                        </button>
                                    </td>

                                    {/* Action Buttons */}
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleEditProduct(product)}
                                            className="p-2 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition-all active:scale-90 cursor-pointer">
                                            <TbEdit className="text-lg md:text-xl" />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* edit drawer */}
            <UpdateProductDrawer
                product={isEditOpen}
                isOpen={!!isEditOpen}
                onClose={() => setIsEditOpen(null)}
            />
        </div>
    )
}

export default AllProducts;