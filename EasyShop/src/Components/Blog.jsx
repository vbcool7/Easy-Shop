
import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useBlogList } from '../hook/useBlog';
import { useTranslation } from 'react-i18next';

function Blog() {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useBlogList();
    const blogs = data?.pages.flatMap(page => page.blogs) || [];

    return (
        <section className="bg-white">

            {/* Top Section */}
            <div className="bg-linear-to-b from-pink-50 to-pink-50 py-12 md:py-24 lg:py-28 px-4 sm:px-5 lg:px-6 text-center overflow-hidden">

                <div className="max-w-4xl mx-auto">

                    {/* Small Badge */}
                    <span className="inline-block px-2 py-1 md:px-4 md:py-1.5 mb-6 text-[8px] md:text-[10px] font-bold tracking-widest text-pink-600 uppercase bg-white rounded-full shadow-sm border border-pink-100">
                        {t('blog.freshPerspectives')}
                    </span>

                    {/* Main Heading */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 tracking-tighter leading-tight">
                        {t('blog.latestBlogs')} <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-rose-400">{t('blog.blogs')}</span>
                    </h1>

                    {/* Subtext */}
                    <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-lg lg:text-xl leading-relaxed font-light">
                        {t('blog.subtitle')} <span className="text-gray-800">{t('blog.fashionTips')}</span> {t('blog.and')} <span className="text-gray-800">{t('blog.seasonalTrends')}</span>.
                    </p>

                    {/* Floating Line (Optional) */}
                    <div className="mt-8 hidden sm:flex justify-center">
                        <div className="w-16 h-1.5 bg-pink-500 rounded-full"></div>
                        <div className="w-4 h-1.5 bg-pink-300 rounded-full ml-2"></div>
                    </div>
                </div>
            </div>

            {/* below section */}
            <div className="max-w-6xl mx-auto px-4 lg:px-6 py-10 md:py-16">

                {/* Grid Setup */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.map((blog) => (
                        <div
                            key={blog._id} 
                            onClick={() => navigate(`/blog_detail/${blog._id}`)}
                            className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between"
                        >
                            {/* Image Section */}
                            <div className="relative overflow-hidden">
                                <img
                                    src={blog.bannerImage}
                                    alt={blog.title}
                                    loading="lazy"
                                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 bg-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                                    {new Date(blog.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <p className="text-pink-500 text-xs font-semibold uppercase tracking-wider mb-2">
                                        {t('blog.by')} {blog.authorCustomName || t('blog.defaultAuthor')}
                                    </p>

                                    <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-pink-500 transition-colors line-clamp-2">
                                        {blog.title}
                                    </h2>

                                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                        {blog.description}
                                    </p>
                                </div>

                                <div className="mt-2 flex items-center justify-between">
                                    <button className="text-pink-600 font-semibold text-sm border-b-2 border-pink-600 hover:text-pink-400 hover:border-pink-400 transition-all cursor-pointer">
                                        {t('blog.readMore')}
                                    </button>
                                    <span className="text-xs text-gray-400 font-medium">
                                        {blog.readTime || '3 min read'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More Section */}
                {hasNextPage && (
                    <div className="flex justify-center mt-12">
                        <button
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="px-8 py-2.5 border-2 border-pink-500 text-pink-500 font-bold rounded-full hover:bg-pink-500 hover:text-white transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isFetchingNextPage ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent text-pink-500 animate-spin rounded-full group-hover:text-white" />
                                    {t('blog.loading')}
                                </>
                            ) : (
                                t('blog.loadMore')
                            )}
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}

export default Blog;