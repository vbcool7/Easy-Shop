
import React, { useState } from 'react'
import { FaSearch } from "react-icons/fa";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
import { useTranslation } from 'react-i18next';

function FAQs() {

    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCat, setSelectedCat] = useState(0);
    const [openIndex, setOpenIndex] = useState(null);

    const faqCategories = t('faqs.categories', { returnObjects: true }) || [];
    const allFaqs = t('faqs.questionsList', { returnObjects: true }) || [];

    const allCatFaqs = allFaqs.filter((item) => {
        const categoryName = faqCategories[selectedCat];

        const matchesCategory = selectedCat === 0 || item.category === allFaqs.find(f => f.category === item.category)?.category;

        const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchTerm.toLowerCase());

        return (selectedCat === 0 || item.category === t(`faqs.categories.${selectedCat}`)) && matchesSearch;
    });

    const filteredFaqs = allFaqs.filter((item) => {
        const structuralCategory = faqCategories[selectedCat];
        const EnglishCategories = ["All", "Orders & Shipping", "Returns & Refunds", "Size & Quality", "Payments & Offers", "Cancellations & Modifications", "Sign Up & Login"];

        const mappedCategoryTarget = EnglishCategories[selectedCat];
        const matchesCategory = selectedCat === 0 || item.category === mappedCategoryTarget;
        const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className='bg-gray-50/30 min-h-[70vh]'>

            {/* Heading Area */}
            <div className="max-w-3xl mx-auto px-6 pt-15 text-center">
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-4">
                    {t('faqs.meta.titlePre')} <span className="text-pink-500">{t('faqs.meta.titlePost')}</span>
                </h2>

                <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-lg lg:text-xl leading-relaxed font-light italic">
                    {t('faqs.meta.subtitle')}
                </p>
            </div>

            {/* main section */}
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 px-4 lg:px-6 py-10 md:py-20 min-h-[70vh]">

                {/* left section - category */}
                <div className='w-full md:w-1/3 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible no-scrollbar md:sticky md:top-24 h-fit pb-4 md:pb-0'>

                    <h3 className="hidden md:block text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 ml-4">
                        {t('faqs.meta.categoriesHeading')}
                    </h3>

                    {faqCategories.map((tab, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setSelectedCat(index);
                                setOpenIndex(false);
                            }}
                            className={`shrink-0 md:w-full flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-2xl transition-all duration-300 cursor-pointer border border-pink-300 md:border-none
                                 ${selectedCat === index
                                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-100 border-pink-500'
                                    : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-500 border-gray-100'
                                }`}
                        >
                            {/* icons */}
                            <span className={`text-lg md:text-xl
                                ${selectedCat === index ? 'text-white' : 'text-pink-300'}`}>
                                < HiOutlineSquares2X2 />
                            </span>

                            <span className='text-xs md:text-sm font-bold text-left whitespace-nowrap md:whitespace-normal'>
                                {tab}
                            </span>

                        </button>
                    ))}
                </div>

                {/* Right Section */}
                <div className='w-full md:w-2/3  py-2 md:py-6'>

                    {/* heading */}
                    <div className='mb-8'>
                        <h1 className='text-2xl md:text-3xl font-black text-gray-900'>
                            {t('faqs.meta.helpSection')} <span className='text-pink-500'>{t('faqs.meta.helpSectionSpan')}</span>
                        </h1>
                        <p className='text-gray-500 text-sm md:text-lg lg:text-xl leading-relaxed font-light mt-2'>
                            {t('faqs.meta.stuckText')}
                        </p>
                    </div>

                    {/* Search Bar Input */}
                    <div className="relative mb-8 md:mb-12">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setOpenIndex(false);
                            }}
                            placeholder={t('faqs.meta.searchPlaceholder')}
                            className="w-full pl-12 pr-4 py-3 md:py-4 text-sm md:text-base bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-pink-200 focus:border-pink-300 outline-none transition-all text-gray-700"
                        />
                    </div>

                    {/* faqs section */}
                    <div className='my-4 md:my-8 space-y-2 md:space-y-4'>
                        {allCatFaqs.length > 0 ? (
                            allCatFaqs.map((item, index) => (
                                <div
                                    key={index}
                                    className='border-b border-gray-100 last:border-none'
                                >
                                    {/* question section */}
                                    <div
                                        onClick={() => toggleFAQ(index)}
                                        className={`flex justify-between items-center px-2 md:px-5 py-4 cursor-pointer transition-all duration-300 group rounded-xl
                                    ${openIndex === index ? "bg-pink-50/30" : "hover:bg-gray-50"}`}
                                    >

                                        <h1 className={`text-[15px] md:text-[18px] font-semibold pr-4 transition-colors duration-300
                                            ${openIndex === index ? "text-pink-500" : "text-[#1F2933]"}`}>
                                            {item.question}
                                        </h1>

                                        <div className="shrink-0">
                                            {openIndex === index
                                                ? (<FaMinus className="text-sm md:text-lg text-pink-500" />)
                                                : (<FaPlus className="text-sm md:text-lg text-gray-400 group-hover:text-[#1F2933]" />)}
                                        </div>
                                    </div>

                                    {/* answer section */}
                                    {openIndex === index && (
                                        <div className='overflow-hidden transition-all duration-300'>

                                            <div className="text-[#555] text-[14px] md:text-[16px] px-4 md:px-6 py-4 bg-gray-50/50 leading-relaxed rounded-b-xl">
                                                {item.answer}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 md:py-16 bg-white rounded-3xl border border-gray-100 shadow-sm px-4">
                                <h2 className="text-lg md:text-xl font-bold text-gray-400 mb-1">{t('faqs.meta.noResults')}</h2>
                                <p className="text-gray-400 text-xs max-w-xs mx-auto">{t('faqs.meta.noResultsSub')}</p>
                            </div>
                        )}
                    </div>

                </div>
            </div >
        </section >
    )
}

export default FAQs;