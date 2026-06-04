
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { IoIosSearch, IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {

    const { i18n } = useTranslation();

    // Language Dropdown States & Refs
    const langDropdownRef = useRef(null);
    const [openLangDropdown, setOpenLangDropdown] = useState(false);
    const [selectedLang, setSelectedLang] = useState(
        i18n.language === 'es' ? 'SPA' : 'ENG'
    );

    const languages = ['ENG', 'SPA'];

    // Language Selection Handler
    const handleLangSelect = (value) => {
        setSelectedLang(value);
        i18n.changeLanguage(value === 'ENG' ? 'en' : 'es');
        setOpenLangDropdown(false);
    };

    // Outside Click for Language Dropdown
    useEffect(() => {
        function handleClickOutsideLang(event) {
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
                setOpenLangDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutsideLang);
        return () => document.removeEventListener("mousedown", handleClickOutsideLang);
    }, []);


    return (
        <div className="relative flex items-center" ref={langDropdownRef}>
            <button
                onClick={() => setOpenLangDropdown(!openLangDropdown)}
                className="flex items-center gap-1 cursor-pointer font-bold text-xs sm:text-sm tracking-wider text-gray-700 hover:text-pink-500 transition-colors py-1.5 focus:outline-none"
            >
                <span>{selectedLang}</span>
                <IoIosArrowDown
                    className={`transition-transform duration-300 text-gray-400 text-xs sm:text-sm ${openLangDropdown ? 'rotate-180 text-pink-500' : ''}`}
                />
            </button>

            {/* lang switcher drop down */}
            <div
                className={`absolute right-0 top-full mt-3 w-28 bg-white border border-gray-100 shadow-2xl rounded-xl z-50 transition-all duration-200 origin-top-right ${openLangDropdown
                    ? 'opacity-100 scale-100 visible translate-y-0'
                    : 'opacity-0 scale-95 invisible -translate-y-1 pointer-events-none'
                    }`}
            >
                {/* triangle notch */}
                <div className="absolute -top-1 right-3 w-2 h-2 bg-white border-t border-l border-gray-100 rotate-45"></div>

                <ul className="py-1.5 relative z-10 bg-white rounded-xl">
                    {languages.map((item) => (
                        <li
                            key={item}
                            onClick={() => handleLangSelect(item)}
                            className={`px-3.5 py-2 text-xs cursor-pointer font-semibold transition-all flex items-center justify-between ${selectedLang === item
                                ? 'bg-pink-50/60 text-pink-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
    );
}

export default LanguageSwitcher;