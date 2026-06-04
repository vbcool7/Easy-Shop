
import React from 'react'
import { useState } from 'react';
import { HiOutlinePhotograph, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';

import { useAddBlog } from '../../hook/useBlog';
import { useTranslation } from 'react-i18next';

function AddBlog({ setCurrentPage }) {

    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        content: '',
        blockquote: '',
        readTime: '3 min read',
        tags: ''
    });

    const [bannerImage, setBannerImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [trendsList, setTrendsList] = useState([{ title: '', desc: '' }]);

    const { mutate, isPending } = useAddBlog();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // banner img
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setBannerImage(null);
        setPreviewUrl('');
    };

    const handleTrendChange = (index, e) => {
        const updatedTrends = [...trendsList];
        updatedTrends[index][e.target.name] = e.target.value;
        setTrendsList(updatedTrends);
    };

    const addMoreTrend = () => {
        setTrendsList([...trendsList, { title: '', desc: '' }]);
    };

    const removeTrend = (index) => {
        const updatedTrends = trendsList.filter((_, i) => i !== index);
        setTrendsList(updatedTrends);
    };

    // FORM SUBMIT 
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!bannerImage) {
            toast.error("Please upload a banner image!");
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('category', formData.category);
        data.append('description', formData.description);
        data.append('content', formData.content);
        data.append('blockquote', formData.blockquote);
        data.append('readTime', formData.readTime);
        data.append('bannerImage', bannerImage);

        // Convert Comma Separated Tags to stringified array for backend parse support
        if (formData.tags) {
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);

            if (tagsArray.length === 0) {
                toast.error("Please enter at least one valid tag.");
                return;
            }

            data.append('tags', JSON.stringify(tagsArray));
        }

        // Filter empty entries out & stringify trends object array
        const filteredTrends = trendsList.filter(t => t.title.trim() !== '' || t.desc.trim() !== '');
        data.append('trendsList', JSON.stringify(filteredTrends));

        mutate(data, {
            onSuccess: (response) => {
                if (response?.success) {
                    toast.success(response.message || "Blog posted successfully!");

                    setFormData({ title: '', category: '', description: '', content: '', blockquote: '', readTime: '3 min read', tags: '' });
                    setBannerImage(null);
                    setPreviewUrl('');
                    setTrendsList([{ title: '', desc: '' }]);
                }
            },
            onError: (error) => {
                console.error("Mutation Form Submission Failed:", error);
                toast.error(error.response?.data?.message || "Failed to create blog. Try again!");
            }
        });
    };

    return (
        <div className='bg-slate-50/50 p-4 md:p-8 min-h-screen text-left'>

            {/* header */}
            <div className='max-w-4xl mx-auto p-4 md:p-8 bg-linear-to-br from-pink-500 to-pink-600 rounded-t-xl md:rounded-t-3xl relative overflow-hidden'>
                <div className='absolute -top-10 -right-10 h-32 w-32 bg-white/10 rounded-full blur-2xl'></div>
                <div className='absolute -bottom-10 -left-10 h-24 w-24 bg-white/10 rounded-full blur-xl'></div>

                <div className='relative z-10 text-center md:text-start'>
                    <h1 className='text-xl md:text-2xl font-bold text-white mb-1'>
                        {t('addBlog.portalTitle')}
                    </h1>
                    <p className='text-pink-50 text-xs font-medium opacity-90'>
                        {t('addBlog.portalSubtitle')}
                    </p>
                </div>
            </div>

            {/* form */}
            <div className='max-w-4xl mx-auto bg-white dark:bg-slate-900 p-5 md:p-8 rounded-b-xl md:rounded-b-3xl shadow-sm border border-pink-50 dark:border-slate-800'>

                <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>

                    {/* blog title */}
                    <div className='flex flex-col gap-1.5 md:gap-2'>
                        <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                            {t('addBlog.labelTitle')}
                        </label>
                        <input
                            type="text"
                            required
                            name='title'
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder={t('addBlog.placeholderTitle')}
                            className="p-2.5 md:p-3.5 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all placeholder:text-[11px] md:placeholder:text-[14px]"
                        />
                    </div>

                    {/* category */}
                    <div className='flex flex-col gap-1.5 md:gap-2'>
                        <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                            {t('addBlog.labelCategory')}
                        </label>
                        <input
                            type="text"
                            required
                            name='category'
                            value={formData.category}
                            onChange={handleInputChange}
                            placeholder={t('addBlog.placeholderCategory')}
                            className="p-2.5 md:p-3.5 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all placeholder:text-[11px] md:placeholder:text-[14px]"
                        />
                    </div>

                    {/* card - short description */}
                    <div className='flex flex-col gap-1.5 md:gap-2 col-span-full'>
                        <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                            {t('addBlog.labelShortSummary')}
                        </label>
                        <textarea
                            rows="2"
                            required
                            name='description'
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder={t('addBlog.placeholderShortSummary')}
                            className="p-3 md:p-4 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all resize-none placeholder:text-[11px] md:placeholder:text-[14px]"
                        />
                    </div>

                    {/* banner image */}
                    <div className="flex flex-col gap-3 col-span-full mt-1">
                        <label className="text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1">
                            {t('addBlog.labelBannerImage')} <span className="text-pink-500">{t('addBlog.requiredIndicator')}</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">

                            <div className="relative h-35 md:h-44 border-2 border-dashed border-pink-100 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center bg-pink-50/10 hover:bg-pink-50/30 transition-all cursor-pointer group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 z-10 cursor-pointer"
                                />
                                <HiOutlinePhotograph className="text-3xl text-pink-400 mb-2" />
                                <p className="text-xs text-pink-500 font-bold">{t('addBlog.uploadCoverBtn')}</p>
                            </div>

                            {/* preview box */}
                            {previewUrl && (
                                <div className="relative h-35 md:h-44 rounded-2xl overflow-hidden border border-pink-100 shadow-sm animate-in zoom-in duration-300">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-white p-1.5 rounded-full text-pink-500 shadow-md hover:bg-pink-50 transition-colors"
                                    >
                                        <HiOutlineX size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* main content */}
                    <div className='flex flex-col gap-1.5 md:gap-2 col-span-full mt-1'>
                        <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                            {t('addBlog.labelFullContent')}
                        </label>
                        <textarea
                            rows="6"
                            required
                            name='content'
                            value={formData.content}
                            onChange={handleInputChange}
                            placeholder={t('addBlog.placeholderFullContent')}
                            className="p-3 md:p-4 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all placeholder:text-[11px] md:placeholder:text-[14px]"
                        />
                    </div>

                    {/* blockquote */}
                    <div className='flex flex-col gap-1.5 md:gap-2 col-span-full bg-pink-50/30 dark:bg-slate-800/50 p-4 rounded-2xl border border-pink-100/50 dark:border-slate-700'>
                        <label className='text-[13px] font-semibold text-slate-700 dark:text-slate-200 ml-1'>
                            {t('addBlog.labelBlockquote')}
                        </label>
                        <p className='text-[11px] text-slate-500 mb-1 ml-1'>{t('addBlog.blockquoteNotice')}</p>
                        <input
                            type="text"
                            name='blockquote'
                            value={formData.blockquote}
                            onChange={handleInputChange}
                            placeholder={t('addBlog.placeholderBlockquote')}
                            className="w-full mt-1.5 p-3 rounded-xl border border-pink-100 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all italic text-pink-700 placeholder:italic placeholder:text-slate-300"
                        />
                    </div>

                    {/* time - read */}
                    <div className='flex flex-col gap-1.5 md:gap-2'>
                        <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                            {t('addBlog.labelReadTime')}
                        </label>
                        <input
                            type="text"
                            name='readTime'
                            value={formData.readTime}
                            onChange={handleInputChange}
                            className="p-2.5 md:p-3.5 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all"
                        />
                    </div>

                    {/* Tags Input Field */}
                    <div className='flex flex-col gap-1.5 md:gap-2'>
                        <label className='text-[13px] md:text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1'>
                            {t('addBlog.labelTags')}
                        </label>
                        <input
                            type="text"
                            name='tags'
                            value={formData.tags}
                            onChange={handleInputChange}
                            placeholder={t('addBlog.placeholderTags')}
                            className="p-2.5 md:p-3.5 rounded-lg md:rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:text-white text-sm transition-all placeholder:text-[11px] md:placeholder:text-[14px]"
                        />
                    </div>

                    {/* Trends List Mapper Section */}
                    <div className="col-span-full mt-2 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {t('addBlog.trendSectionHeading')}
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    {t('addBlog.trendSectionNotice')}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={addMoreTrend}
                                className="px-3 py-1.5 text-xs bg-slate-900 text-white dark:bg-pink-600 dark:hover:bg-pink-700 rounded-xl font-bold uppercase hover:bg-slate-800 transition-all cursor-pointer"
                            >
                                {t('addBlog.addSectionBtn')}
                            </button>
                        </div>

                        {trendsList.map((trend, index) => (
                            <div
                                key={index}
                                className="flex gap-4 items-start bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 mb-3 animate-in fade-in slide-in-from-top-1 duration-200">

                                <div className="flex-1 space-y-2.5">
                                    <input
                                        type="text"
                                        name="title"
                                        value={trend.title}
                                        onChange={(e) => handleTrendChange(index, e)}
                                        placeholder={t('addBlog.placeholderTrendHeading', { index: index + 1 })}
                                        className="w-full px-3 py-2 bg-slate-50/70 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-pink-400 dark:text-white"
                                    />

                                    <input
                                        type="text"
                                        name="desc"
                                        value={trend.desc}
                                        onChange={(e) => handleTrendChange(index, e)}
                                        placeholder={t('addBlog.placeholderTrendDesc')}
                                        className="w-full px-3 py-2 bg-slate-50/70 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-pink-400 dark:text-white"
                                    />
                                </div>

                                {trendsList.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeTrend(index)}
                                        className="p-1.5 text-xs text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer mt-1"
                                    >
                                        {t('addBlog.removeSectionBtn')}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* action */}
                    <div className='col-span-full flex flex-col sm:flex-row items-center justify-end gap-3 mt-4 md:mt-6 pt-6 border-t border-slate-50 dark:border-slate-800'>

                        <button
                            type="button"
                            disabled={isPending}
                            onClick={() => setCurrentPage('blogs')}
                            className='w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-pink-500 hover:bg-pink-100 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-transparent disabled:hover:text-slate-500'
                        >
                            {t('addBlog.cancelBtn')}
                        </button>

                        <button
                            type="submit"
                            disabled={isPending}
                            className='w-full sm:w-auto md:px-10 py-2.5 rounded-xl text-sm font-bold text-white bg-linear-to-br from-pink-500 to-pink-600 shadow-lg shadow-pink-100 dark:shadow-none hover:shadow-pink-200 transition-all cursor-pointer active:scale-95 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:active:scale-100 disabled:shadow-none'
                        >
                            {isPending ? t('addBlog.publishingBtnState') : t('addBlog.submitBtnState')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddBlog;