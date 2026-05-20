
import React from 'react';
import { useState } from 'react';
import { TbEdit } from "react-icons/tb";
import { LiaTrashSolid } from "react-icons/lia";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { HiOutlineExclamation, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

import EditBlogDrawer from './EditBlogDrawer';
import { useToggleBlogVisibility, useVendorBlogList } from '../../hook/useBlog';

function Blogs({ setCurrentPage }) {

  const { data: blogResponse, isLoading, isError } = useVendorBlogList();
  const blogs = blogResponse;

  const { mutate: toggleVisibility, isPending: isToggling } = useToggleBlogVisibility();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeletedOpen, setIsDeletedOpen] = useState(false);

  const [selectedBlog, setSelectedBlog] = useState("");

  // edit
  const handleEditBlog = (blog) => {
    setIsEditOpen(blog)
  };

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
              Total: {blogs.length}
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
                <th scope="col" className="px-6 py-4">Date Created</th>
                <th scope="col" className="px-6 py-4 text-center">Status</th>
                <th scope="col" className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {blogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        No Blogs Found
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        You have never created any Blog yet.
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

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(blog.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300
                          ${blog.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'
                            : blog.status === 'Pending'
                              ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50'
                              : 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50'
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full animate-pulse
                          ${blog.status === 'Approved' ? 'bg-emerald-500' : blog.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'}`}
                        />
                        {blog.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-2.5">
                        <button
                          onClick={() => handleEditBlog(blog)}
                          className="p-2 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition-all active:scale-90 cursor-pointer"
                        >
                          <TbEdit className="text-lg md:text-xl" />
                        </button>

                        <button
                          disabled={isToggling}
                          onClick={() => toggleVisibility(blog._id)}
                          className={`p-2 rounded-xl border transition-all duration-300 flex items-center gap-1.5 font-medium text-xs cursor-pointer active:scale-95 disabled:opacity-50
                            ${blog.isActive
                              ? 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                          title={blog.isActive ? "Click to Hide from Home" : "Click to Show on Home"}
                        >
                          {blog.isActive ? (
                            <>
                              <HiOutlineEye size={16} className={isToggling ? "animate-spin" : ""} />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <HiOutlineEyeOff size={16} className={isToggling ? "animate-spin" : ""} />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* edit drawer */}
      <EditBlogDrawer
        blog={isEditOpen}
        isOpen={!!isEditOpen}
        onClose={() => setIsEditOpen(null)}
      />

    </div>
  );
};

export default Blogs;