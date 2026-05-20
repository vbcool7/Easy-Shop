
import React from 'react'
import Logo from '../assets/Images/Logo.png';
import { FaFacebook } from "react-icons/fa6";
import { FaTwitter } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { useNavigate, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import EasyShopLoader from '../Components/EasyShopLoader';

import { useBlogDetail, useRelatedBlogs } from '../hook/useBlog';

function BlogDetail() {

    const { blogId } = useParams();
    const navigate = useNavigate();

    const { data: blogDetail, isLoading, isError } = useBlogDetail(blogId);

    const { data } = useRelatedBlogs(blogId);
    const relatedBlogs = data?.relatedBlogs || [];

    console.log(relatedBlogs);

    const shareLinks = [
        { name: 'Facebook', icon: <FaFacebook />, color: 'hover:bg-blue-600' },
        { name: 'Twitter', icon: <FaTwitter />, color: 'hover:bg-sky-500' },
        { name: 'LinkedIn', icon: <FaLinkedinIn />, color: 'hover:bg-blue-700' },
        { name: 'WhatsApp', icon: <IoLogoWhatsapp />, color: 'hover:bg-green-500' },
    ];

    if (isLoading) {
        return <EasyShopLoader />
    }

    if (isError || !blogDetail) {
        return (
            <div className="text-center py-20 text-red-500 font-medium">
                Blog Details could not be loaded. Please try again.
            </div>
        );
    }

    return (
        <section className="bg-white">

            {/* Top Section */}
            <div className="relative bg-linear-to-b from-pink-50 to-pink-50 py-12 md:py-24 lg:py-28 px-6 overflow-hidden">

                {/* Subtle Decorative Elements (Optional) */}
                <div className="hidden md:block absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-pink-200 rounded-full blur-3xl opacity-30"></div>
                <div className="hidden md:block absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-pink-300 rounded-full blur-3xl opacity-20"></div>

                <div className="max-w-4xl mx-auto relative z-10">

                    {/* badge */}
                    <div className="flex justify-center md:mb-6">
                        <span className="inline-block px-2 py-1 md:px-4 md:py-1.5 mb-6 text-[10px] md:text-xs font-bold tracking-widest text-pink-600 uppercase bg-white rounded-full shadow-sm border border-pink-100">
                            {blogDetail.category}
                        </span>
                    </div>

                    {/* Blog Title */}
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8 text-center leading-tight tracking-tight px-2">
                        {blogDetail.title}
                    </h1>

                    {/* Author & Meta Info */}
                    <div className='flex items-center justify-center gap-3 md:gap-6'>
                        <div className="relative">
                            <img
                                src={blogDetail.authorId?.storeLogo || Logo}
                                alt={blogDetail.authorCustomName || "EasyShop Author"}
                                className='w-14 h-14 md:w-18 md:h-18 object-contain rounded-full bg-white p-2 border border-pink-200 shadow-md'
                                onError={(e) => {
                                    e.target.src = Logo;
                                }}
                            />
                        </div>

                        <div className='h-10 w-px bg-pink-200 hidden md:block'></div> {/* Vertical Divider */}

                        <div className='flex flex-col'>
                            <h4 className='text-gray-900 font-bold text-md md:text-lg leading-none'>
                                {blogDetail.authorCustomName || "EasyShop Team"}
                            </h4>

                            <div className="flex items-center gap-2 text-gray-500 text-xs md:text-sm mt-2">
                                <span>
                                    {new Date(blogDetail.createdAt).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric'
                                    })}
                                </span>

                                <span className="w-1 h-1 bg-pink-300 rounded-full"></span>

                                <span>
                                    {blogDetail.readTime || '3 min read'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* section */}
            <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 md:pt-16">

                <div className='shadow-xl md:shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden'>
                    <img
                        src={blogDetail.bannerImage}
                        alt={blogDetail.title}
                        className='h-64 sm:h-96 md:h-125 w-full object-cover shadow-inner'
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-3xl mx-auto px-4 py-5 md:py-10">

                {/* content */}
                <article className="prose prose-lg max-w-none">

                    <p className="text-gray-700 text-lg md:text-xl leading-relaxed first-letter:text-5xl md:first-letter:text-7xl first-letter:font-bold first-letter:text-pink-500 first-letter:mr-3 first-letter:float-left">
                        {blogDetail.description}
                    </p>

                    <p className="text-gray-600 leading-8 mb-6 whitespace-pre-line">
                        {blogDetail.content}
                    </p>

                    {blogDetail.blockquote && (
                        <div className="my-10 border-l-4 border-pink-500 bg-pink-50 p-8 rounded-r-2xl italic">
                            <p className="text-md md:text-2xl text-gray-800 font-medium">
                                "{blogDetail.blockquote}"
                            </p>
                        </div>
                    )}

                    {/* trends */}
                    {blogDetail.trendsList && blogDetail.trendsList.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 tracking-tight">
                                Latest Trends & Highlights
                            </h2>

                            <div className="space-y-4">
                                {blogDetail.trendsList.map((point, i) => (
                                    <div
                                        key={point._id || i}
                                        className="p-5 md:p-6 bg-slate-50/70 rounded-2xl border border-slate-100/80 hover:border-pink-100 dark:hover:border-pink-900/30 transition-all duration-200 shadow-xs flex flex-col gap-1.5"
                                    >
                                        <h3 className="text-md md:text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0"></span>
                                            {point.title}
                                        </h3>

                                        <p className="text-sm md:text-base text-gray-600 leading-relaxed pl-4">
                                            {point.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </article>

                {/* Share Section */}
                <div className="flex flex-col md:flex-row items-center justify-between border-y border-gray-100 py-6 my-5 md:my-12 gap-4">
                    <h5 className="text-gray-900 font-bold uppercase tracking-widest text-xs">Share this story</h5>
                    <div className="flex gap-4">
                        {shareLinks.map((links, index) => (
                            <button
                                key={index}
                                className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-all duration-300 cursor-pointer text-md shadow-sm"
                                title={`Share on ${links}`}
                            >
                                {links.icon}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* related blogs */}
            <div className="max-w-6xl mx-auto px-4 lg:px-6 bg-gray-50/50 rounded-3xl mb-20 py-8 md:py-12">
                <div className="flex justify-between items-end md:mb-10">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-black text-gray-900 mt-2">
                            Related Stories
                        </h3>
                    </div>

                    {/* View all for desktop - Ab tabhi dikhega jab related blogs hon */}
                    {relatedBlogs && relatedBlogs.length > 0 && (
                        <button
                            onClick={() => navigate('/blog')}
                            className="hidden md:flex text-pink-600 font-bold text-sm hover:underline cursor-pointer">
                            View All →
                        </button>
                    )}
                </div>

                {/* View all for mobile */}
                {relatedBlogs && relatedBlogs.length > 0 && (
                    <button
                        onClick={() => navigate('/blog')}
                        className="md:hidden w-full my-3 text-pink-600 font-bold text-sm text-end hover:underline cursor-pointer">
                        View All →
                    </button>
                )}

                {relatedBlogs && relatedBlogs.length > 0 ? (
                    // Case A: Related Blogs Found
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedBlogs.map((item) => (
                            <div
                                key={item._id}
                                onClick={() => {
                                    navigate(`/blog_detail/${item._id}`);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="group cursor-pointer"
                            >
                                <div className="relative overflow-hidden rounded-xl md:rounded-2xl aspect-video mb-4">
                                    <img
                                        src={item.bannerImage}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <h4 className="font-bold text-gray-900 group-hover:text-pink-500 transition-colors line-clamp-2 leading-snug">
                                    {item.title}
                                </h4>

                                <p className="text-gray-500 text-xs mt-2 uppercase tracking-tighter font-semibold">
                                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric'
                                    })}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Case B: No Related Blogs Found (Premium Empty State)
                    <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-2xl border border-dashed border-gray-200 bg-white shadow-xs">
                        <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h5 className="text-gray-800 font-bold text-lg mb-1">
                            No Related Blogs Found
                        </h5>
                        <p className="text-gray-500 text-sm max-w-sm mb-5">
                            We couldn't find any similar stories in this category right now. Explore our main feed for more updates.
                        </p>
                        <button
                            onClick={() => navigate('/blog')}
                            className="px-5 py-2 text-xs bg-pink-500 text-white font-bold rounded-full hover:bg-pink-600 transition-all shadow-xs active:scale-95 cursor-pointer"
                        >
                            Explore All Blogs
                        </button>
                    </div>
                )}
            </div>

            {/* comment post */}
            <div className="max-w-3xl mx-auto my-16 md:my-18 px-4">
                <h4 className="text-xl font-bold mb-6 text-gray-900">Leave a Reply</h4>
                <textarea
                    className="w-full p-6 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-200 outline-none text-gray-600 transition-all"
                    placeholder="What are your thoughts on this trend?"
                    rows="4"
                ></textarea>
                <button className="mt-4 bg-gray-900 text-white px-6 py-2 md:px-8 md:py-3 rounded-full font-bold hover:bg-pink-600 transition-all active:scale-95 cursor-pointer">
                    Post Comment
                </button>
            </div>

        </section>
    )
}

export default BlogDetail