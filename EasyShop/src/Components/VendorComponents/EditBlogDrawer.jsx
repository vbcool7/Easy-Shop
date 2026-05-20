
import React, { useEffect, useState } from 'react';
import { HiOutlineX, HiOutlineCloudUpload } from "react-icons/hi";
import toast from 'react-hot-toast';

import { useUpdateBlog } from '../../hook/useBlog';

function EditBlogDrawer({ blog, isOpen, onClose }) {

  const { mutate: updateBlog, isPending: isUpdating } = useUpdateBlog();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [readTime, setReadTime] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [blockquote, setBlockquote] = useState('');
  const [tags, setTags] = useState('');
  const [trendsList, setTrendsList] = useState(['']);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (blog && isOpen) {
      setTitle(blog.title || '');
      setCategory(blog.category || '');
      setReadTime(blog.readTime || '');
      setDescription(blog.description || '');
      setContent(blog.content || '');
      setBlockquote(blog.blockquote || '');
      setImagePreview(blog.bannerImage || '');
      setImageFile(null);

      // Handle Tags Array to String
      if (blog.tags && Array.isArray(blog.tags)) {
        setTags(blog.tags.join(', '));
      } else {
        setTags('');
      }

      // handle trendsList
      if (blog.trendsList && Array.isArray(blog.trendsList) && blog.trendsList.length > 0) {
        const extractedTrends = blog.trendsList.map(item => typeof item === 'object' ? item.title || item.name : item);
        setTrendsList(extractedTrends);
      } else {
        setTrendsList(['']);
      }
    }
  }, [blog, isOpen]);

  if (!isOpen) return null;

  // Handle Local Image Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // handle trend list
  const handleTrendChange = (index, value) => {
    const updatedTrends = [...trendsList];
    updatedTrends[index] = value;
    setTrendsList(updatedTrends);
  };

  const addTrendField = () => {
    setTrendsList([...trendsList, '']);
  };

  const removeTrendField = (index) => {
    if (trendsList.length > 1) {
      const updatedTrends = trendsList.filter((_, i) => i !== index);
      setTrendsList(updatedTrends);
    } else {
      setTrendsList(['']);
    }
  };

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !category || !content.trim()) {
      return toast.error("Title, Category, and Content are required fields!");
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('category', category);
    formData.append('readTime', readTime.trim());
    formData.append('description', description.trim());
    formData.append('content', content.trim());
    formData.append('blockquote', blockquote.trim());

    const processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    formData.append('tags', JSON.stringify(processedTags));

    // backend expect obj data so convert it in obj
    const processedTrends = trendsList
      .map(item => item.trim())
      .filter(item => item !== '')
      .map(item => ({ title: item }));

    formData.append('trendsList', JSON.stringify(processedTrends));

    if (imageFile) {
      formData.append('bannerImage', imageFile);
    }

    updateBlog({ blog_id: blog._id, formData }, {
      onSuccess: (res) => {
        toast.success(res.message || "Blog Update Successfull");
        onClose();
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to update");
      }
    });
  };

  return (
    <>
      {/* Backdrop Blur overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-md transition-opacity duration-500 opacity-100"
      />

      {/* drawer container */}
      <div className="fixed inset-y-0 right-0 z-70 w-full max-w-xl bg-white dark:bg-slate-950 shadow-2xl transform transition-transform duration-500 ease-in-out translate-x-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">

          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                Edit Blog <span className="text-pink-500 text-[10px] font-bold px-2 py-0.5 bg-pink-50 dark:bg-pink-950/50 rounded-full uppercase tracking-wider">Admin Mode</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono mt-1">
                ID: {blog?._id}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-full transition-all"
            >
              <HiOutlineX size={22} />
            </button>
          </div>

          {/* content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">

            {/* Title Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Blog Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter captivating title..."
                className="mt-2 w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
              />
            </div>

            {/* cat and tym */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Beauty & Skincare"
                  className="mt-2 w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Read Time</label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="e.g., 5 min read"
                  className="mt-2 w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                />
              </div>
            </div>

            {/* image upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Banner Image
              </label>
              <div className="mt-2 flex flex-col sm:flex-row gap-4 items-center border border-dashed border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Banner Preview"
                    className="w-24 h-24 object-cover rounded-xl border border-pink-50"
                  />
                )}
                <label className="flex-1 flex flex-col items-center justify-center py-4 bg-slate-50 dark:bg-slate-900 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all w-full">
                  <HiOutlineCloudUpload
                    size={24}
                    className="text-pink-500" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                    Upload New Image
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Leave empty to keep existing image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* short desc */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Short Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a brief overview snippet..."
                className="mt-2 w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all resize-none"
              />
            </div>

            {/* content area */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Blog Content</label>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your full article body here..."
                className="mt-2 w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
              />
            </div>

            {/* blockquote */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Highlight Quote (Blockquote)</label>
              <input
                type="text"
                value={blockquote}
                onChange={(e) => setBlockquote(e.target.value)}
                placeholder="e.g., Buy less, choose well."
                className="mt-2 w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
              />
            </div>

            {/* tags and trend list */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="skincare, summer, fashion"
                  className="mt-2 w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                />
              </div>

              {/* Dynamic Trends List Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Trends List</label>
                  <button
                    type="button"
                    onClick={addTrendField}
                    className="text-xs font-bold text-pink-500 hover:text-pink-600 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    + Add Trend Point
                  </button>
                </div>

                <div className="space-y-2">
                  {trendsList.map((trend, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 font-mono w-5">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={trend}
                        onChange={(e) => handleTrendChange(index, e.target.value)}
                        placeholder={`Enter trend point ${index + 1}...`}
                        className="flex-1 text-sm px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removeTrendField(index)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* action */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="px-5 py-2.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-linear-to-br from-pink-500 to-pink-600 text-white hover:shadow-lg hover:shadow-pink-200 dark:hover:shadow-none active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {isUpdating ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}

export default EditBlogDrawer;