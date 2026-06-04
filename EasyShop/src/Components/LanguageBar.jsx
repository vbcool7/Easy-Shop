
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useRef } from 'react';
import { IoIosArrowDown } from "react-icons/io";

function LanguageBar() {

    const { i18n, t } = useTranslation();
    const dropdownRef = useRef(null);
    const [openDropdown, setOpenDropdown] = useState(false);
    
    const [selectedLang, setSelectedLang] = useState(
        i18n.language === 'es' ? 'SPA' : 'ENG'
    );

    const languages = ['ENG', 'SPA'];

    const handleSelect = (value) => {
        setSelectedLang(value);
        i18n.changeLanguage(value === 'ENG' ? 'en' : 'es'); // ← add this line
        setOpenDropdown(false);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <section className="w-full bg-[#f8fafc] border-b border-slate-200/80  z-999 px-4 lg:px-8">
            <div className="max-w-6xl mx-auto py-2 flex justify-between items-center text-slate-500 font-medium select-none">

                {/* Left Side: Announcement Text */}
                <p className="text-[11px] md:text-xs tracking-wide truncate max-w-[65%] font-medium text-slate-500">
                    {t('nav.announcement')}
                </p>

                {/* Right Side Section */}
                <div className="flex items-center gap-4 text-[11px] md:text-xs shrink-0">

                    {/* Language Dropdown Container */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setOpenDropdown(!openDropdown)}
                            className="flex items-center gap-1.5 cursor-pointer font-bold tracking-wider text-slate-600 hover:text-pink-600 transition-colors py-1 focus:outline-none"
                        >
                            <span>{selectedLang}</span>
                            <IoIosArrowDown
                                className={`transition-transform duration-300 text-slate-400 ${openDropdown ? 'rotate-180 text-pink-500' : ''
                                    }`}
                            />
                        </button>

                        {/* PREMIUM CAPSULE DROPDOWN MENU */}
                        <div
                            className={`absolute right-0 mt-2.5 w-28 bg-white border border-slate-100 shadow-2xl rounded-xl z-9999 transition-all duration-200 origin-top-right ${openDropdown
                                ? 'opacity-100 scale-100 visible translate-y-0'
                                : 'opacity-0 scale-95 invisible -translate-y-1 pointer-events-none'
                                }`}
                        >
                            {/* Premium Top Triangle Notch */}
                            <div className="absolute -top-1 right-3 w-2 h-2 bg-white border-t border-l border-slate-100 rotate-45"></div>

                            <ul className="py-1.5 relative z-10 bg-white rounded-xl">
                                {languages.map((item) => (
                                    <li
                                        key={item}
                                        onClick={() => handleSelect(item)}
                                        className={`px-3.5 py-2 text-xs cursor-pointer font-semibold transition-all flex items-center justify-between ${selectedLang === item
                                            ? 'bg-pink-50/60 text-pink-600'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        <span>{item === 'ENG' ? 'English' : 'Spanish'}</span>
                                        {selectedLang === item && (
                                            <span className="text-[10px] font-bold">✓</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>


                </div>
            </div>
        </section>
    );
}

export default LanguageBar;