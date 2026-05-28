
import React from 'react';
import { useGetCmsContent } from '../hook/useCms';

function PolicyTerms() {

    const { data, isLoading, isError } =useGetCmsContent('terms_policy');

    if (isLoading) return (
        <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
            <div className="h-7 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-5/6" />
            <div className="h-4 bg-slate-100 rounded w-4/6" />
        </div>
    );

    if (isError || !data || data.status !== 'published') return (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-400 text-sm">
            This page is not available yet.
        </div>
    );

    return (
        <div className="bg-white min-h-[70vh] px-4 lg:px-6 py-10 md:py-12">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8">
                    {data.title}
                </h1>
                <div
                    className="prose prose-sm max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-lg prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 prose-blockquote:border-l-4 prose-blockquote:border-pink-400 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-500"
                    dangerouslySetInnerHTML={{ __html: data.content }}
                />
            </div>
        </div>
    );
}

export default PolicyTerms;