
import React from 'react';
import { TbEdit } from "react-icons/tb";
import { LiaTrashSolid } from "react-icons/lia";
import { HiOutlineExclamation, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

import { useBlogList, useDeleteBlog, useUpdateBlogStatus } from '../hooks/useBlogs';
import EditBlogDrawer from './EditBlogDrawer';
import { useState, useEffect } from 'react';
import { getPaginationRange } from '../utils/getPaginationRange';

function Blogs({ setCurrentPage }) {

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

    const { data: blogResponse, isLoading, isError } = useBlogList({ search: debouncedSearch, page });
    const blogs = blogResponse?.data || [];
    const totalPages = blogResponse?.totalPages || 1;

    const { mutate: toggleStatus, isPending: isUpdating } = useUpdateBlogStatus();
    const { mutate: deleteBlog, isPending: isDeleting } = useDeleteBlog();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeletedOpen, setIsDeletedOpen] = useState(false);

    const [selectedBlog, setSelectedBlog] = useState(null);

    // status toggle
    const statusStyles = {
        Approved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        Pending: 'bg-amber-50  text-amber-600  border-amber-200',
        Rejected: 'bg-rose-50   text-rose-600   border-rose-200',
    };

    // edit
    const handleEditBlog = (blog) => {
        setIsEditOpen(blog)
    };

    // delete
    const handleDeleteClick = (blog) => {
        setSelectedBlog(blog);
        setIsDeletedOpen(true);
    }

    const handleDeleteBlog = () => {
        if (!selectedBlog?._id) return;

        deleteBlog(selectedBlog._id, {
            onSuccess: () => {
                setIsDeletedOpen(false);
                setSelectedBlog(null);
            }
        });
    }

    if (isLoading) return <p className="p-10 text-center">Loading blogs...</p>;
    if (isError) return <p className="p-10 text-center text-red-500">Error fetching blogs!</p>;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl md:rounded-3xl border border-pink-50 dark:border-slate-800 shadow-sm overflow-hidden">

            {/* Heading with Search & Add Button */}
            <div className="p-4 md:p-6 border-b border-pink-50 dark:border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                <div>
                    <div className='flex items-center gap-2.5'>
                        <h2 className="text-md md:text-lg font-bold text-slate-800 dark:text-white shrink-0">
                            All Published Blogs
                        </h2>

                        <span className="bg-pink-100 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 px-2.5 py-0.5 md:py-1 rounded-full text-[11px] md:text-xs font-bold">
                            Total: {blogs?.length || 0}
                        </span>
                    </div>

                    <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Manage, edit, or remove seasonal articles and style trends.
                    </p>
                </div>

                {/* Search & Button Group */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search blogs..."
                        className="w-full sm:w-64 text-sm px-4 py-2 md:py-2.5 rounded-xl border border-pink-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-xs placeholder:text-xs md:placeholder:text-[13px] dark:text-white"
                    />

                    {/* Add Button */}
                    <button
                        onClick={() => setCurrentPage('create-blog')}
                        className="w-full sm:w-auto bg-linear-to-br from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-pink-200 dark:hover:shadow-none transition-all active:scale-95 shrink-0 cursor-pointer"
                    >
                        + Add New
                    </button>
                </div>
            </div>

            {/* table */}
            <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">

                        {/* Table Head */}
                        <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th scope="col" className="px-6 py-4">Blog Info</th>
                                <th scope="col" className="px-6 py-4">Category</th>
                                <th scope="col" className="px-6 py-4">Created By</th>
                                <th scope="col" className="px-6 py-4">Date Created</th>
                                <th scope="col" className="px-6 py-4 text-center">Status</th>
                                <th scope="col" className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                            {blogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                No Blogs Found
                                            </p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                System me koi bhi blog available nahi hai.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                blogs.map((blog) => (
                                    <tr
                                        key={blog._id}
                                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        {/* Image + Title */}
                                        <td className="px-6 py-4 flex items-center gap-3 font-medium text-slate-900 dark:text-white">
                                            <img
                                                src={blog.bannerImage}
                                                alt={blog.title}
                                                className="w-10 h-10 rounded-xl object-cover border border-slate-100 dark:border-slate-700"
                                            />
                                            <div className="max-w-xs">
                                                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                                                    {blog.title}
                                                </p>
                                                <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                                                    {blog.readTime || '3 min read'}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Category Badge */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 bg-pink-50 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400 text-xs font-semibold rounded-full border border-pink-100/50 dark:border-none">
                                                {blog.category}
                                            </span>
                                        </td>

                                        {/* Created By Role & Name */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-0.5">
                                                <div>
                                                    {blog.authorType === 'Admin' ? (
                                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 text-[10px] font-bold uppercase rounded-md tracking-wider border border-blue-100 dark:border-none">
                                                            Admin
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 text-[10px] font-bold uppercase rounded-md tracking-wider border border-purple-100 dark:border-none">
                                                            Vendor
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 truncate max-w-30">
                                                    {blog.authorCustomName || "EasyShop Team"}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                            {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </td>

                                        {/* Status Select Dropdown */}
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <select
                                                value={blog.status || 'Pending'}
                                                disabled={isUpdating}
                                                onChange={(e) => toggleStatus({ blog_id: blog._id, status: e.target.value })}
                                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border cursor-pointer outline-none transition-all
                                                ${statusStyles[blog.status] || statusStyles.Pending}`}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="inline-flex items-center gap-2.5">
                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => handleEditBlog(blog)}
                                                    className="p-2 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition-all active:scale-90 cursor-pointer"
                                                >
                                                    <TbEdit className="text-lg md:text-xl" />
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDeleteClick(blog)}
                                                    disabled={isDeleting}
                                                    className={`p-2 rounded-lg transition-all 
                                                        ${isDeleting
                                                            ? "bg-red-50/50 text-red-300 cursor-not-allowed opacity-70"
                                                            : "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white active:scale-90 cursor-pointer"
                                                        }`}
                                                >
                                                    <LiaTrashSolid className={`text-lg md:text-xl ${isDeleting ? "animate-pulse" : ""}`} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
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
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* edit drawer */}
            <EditBlogDrawer
                blog={isEditOpen}
                isOpen={!!isEditOpen}
                onClose={() => setIsEditOpen(null)}
            />

            {/* delete popup */}
            <div
                className={`fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-100 px-4 transition-all duration-300 
                 ${isDeletedOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
            >
                <div
                    onClick={() => setIsDeletedOpen(false)}
                    className="absolute inset-0"
                ></div>

                <div
                    onClick={(e) => e.stopPropagation()}
                    className={`relative transform transition-all duration-300 rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 shadow-2xl w-full max-w-md border border-pink-50 dark:border-slate-800
                    ${isDeletedOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
                >
                    <button
                        onClick={() => setIsDeletedOpen(false)}
                        className="absolute top-6 right-6 text-slate-400 hover:text-pink-500 transition-colors"
                    >
                        <HiOutlineX size={20} />
                    </button>

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 mb-6">
                        <HiOutlineExclamation className="h-8 w-8 text-red-500" />
                    </div>

                    <div className="text-center">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                            Remove Blog
                        </h3>
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                            Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-white">" {selectedBlog?.title || "this item"}"</span>?
                            This action cannot be undone.
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => !isDeleting && setIsDeletedOpen(false)}
                            disabled={isDeleting}
                            className="w-full justify-center rounded-2xl bg-white px-3 py-3.5 text-sm font-bold text-slate-600 border border-slate-100 hover:bg-slate-50 transition-all sm:w-1/2 active:scale-95"
                        >
                            No, Keep it
                        </button>

                        <button
                            type="button"
                            onClick={handleDeleteBlog}
                            disabled={isDeleting}
                            className="w-full justify-center rounded-2xl bg-linear-to-br from-red-500 to-red-600 px-3 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-100 hover:from-red-600 hover:to-red-700 transition-all sm:w-1/2 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? (
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                            ) : (
                                <HiOutlineTrash size={18} />
                            )}
                            {isDeleting ? "Deleting..." : "Yes, Delete"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Blogs;