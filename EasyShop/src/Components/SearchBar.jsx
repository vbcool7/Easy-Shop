
import React, { useState, useEffect, useRef } from 'react';
import Logo from '../assets/Images/Logo.png';
import { Link } from 'react-router-dom';
import { IoIosSearch, IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FiUser } from "react-icons/fi";
import { GoHeart } from "react-icons/go";
import { PiShoppingCartSimple } from "react-icons/pi";
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import toast from 'react-hot-toast';

import useAuthStore from '../store/useAuthStore';
import { useUserLogout, useVendorLogout } from '../hook/useAuth';
import { useCatList } from '../hook/useCategories';
import { useSearchSuggestions } from '../hook/uesProducts';
import { useQueryClient } from '@tanstack/react-query';

import { useTranslation } from 'react-i18next';

function SearchBar() {

    const { i18n, t } = useTranslation();

    const { user } = useAuthStore();
    const { cartItems } = useCart();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Language Dropdown States & Refs
    const langDropdownRef = useRef(null);
    const [openLangDropdown, setOpenLangDropdown] = useState(false);
    const [selectedLang, setSelectedLang] = useState(
        i18n.language === 'es' ? 'SPA' : 'ENG'
    );
    const languages = ['ENG', 'SPA'];

    const queryClient = useQueryClient();

    const { data: catList, isLoading } = useCatList();
    const { mutate: logoutUser, isUserPending } = useUserLogout();
    const { mutate: logoutVendor, isVendorPending } = useVendorLogout();

    const {
        searchQuery,
        setSearchQuery,
        suggestions,
        showDropdown,
        setShowDropdown,
        dropdownRef,
        clearSearch
    } = useSearchSuggestions(300);

    const clearStore = useAuthStore((state) => state.logout); // Zustand logout

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

    // logout
    const handleLogout = () => {

        const logoutMutation = user?.role === 'vendor' ? logoutVendor : logoutUser;

        logoutMutation(null, {
            onSuccess: (res) => {
                clearStore();
                queryClient.clear();
                navigate('/login');
                toast.success(res.message || "Logout successful!");
            },
            onError: (error) => {
                clearStore();
                queryClient.clear();
                navigate('/login')
            }
        });
    };

    //quantity update
    const totalQuantity = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        if (searchQuery.trim()) {
            setShowDropdown(false);
            setIsOpen(false);
            navigate(`/search?query=${searchQuery}`);
            setSearchQuery("");
        }
    };

    // Filter FAQs
    const allFaqs = t('faqs.questionsList', { returnObjects: true }) || [];

    const searchFaqs = Array.isArray(allFaqs)
        ? allFaqs.filter(f =>
            f.question?.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 2)
        : [];

    // redirect
    const handleRedirect = (item, type) => {
        clearSearch();
        if (type === 'product') {
            navigate(`/product_detail/${item._id}/${item.prodName}`);
        } else if (type === 'faq') {
            // navigate(`/faqs?query=${item.question}`);
            navigate(`/faqs?query=${encodeURIComponent(item.question)}`);
        }
    };

    return (
        <section className="w-full bg-white sticky top-0 z-50 shadow-sm px-4 lg:px-6">
            <div className="max-w-6xl mx-auto flex flex-wrap md:flex-nowrap items-center justify-between py-4">

                {/* Logo Section */}
                <Link to="/" className='flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity'>
                    <div className="flex items-center order-1 w-auto hover:scale-95 active:scale-95 transition-all duration-500">
                        <img
                            src={Logo}
                            alt="Logo"
                            className="h-10 w-auto object-contain" />
                    </div>
                </Link>

                {/* wishlist, cart, lang, acc Icons */}
                <div className="flex items-center justify-end gap-3 sm:gap-4 md:gap-6 order-2 w-auto md:order-3 select-none shrink-0">

                    <div className="flex items-center gap-3 sm:gap-4 text-2xl text-gray-600">

                        {/* wishlist Icon */}
                        <GoHeart
                            onClick={() => navigate("/wishlist")}
                            className="cursor-pointer hover:text-pink-500 transition-colors" />

                        {/* cart Icon with Badge */}
                        <div
                            onClick={() => navigate("/cart")}
                            className="relative cursor-pointer group">
                            <PiShoppingCartSimple
                                className="hover:text-pink-500 transition-colors" />

                            {totalQuantity > 0 ? (
                                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                    {totalQuantity}
                                </span>
                            ) : (
                                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                    0
                                </span>
                            )}
                        </div>

                        {/* language switcher */}
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

                        {/* Account Section */}
                        <div className="relative">
                            <div
                                onClick={() => setIsAccountOpen(!isAccountOpen)}
                                className="flex items-center gap-2 md:bg-gray-100 md:px-4 md:py-1.5 rounded-full cursor-pointer hover:bg-pink-50 transition-all group"
                            >
                                <FiUser className={`text-xl ${isAccountOpen ? 'text-pink-500' : 'text-gray-600'} group-hover:text-pink-500`} />
                                <span className="hidden md:flex text-sm font-semibold text-gray-700 group-hover:text-pink-500">
                                    {t('nav.account')}
                                </span>
                            </div>

                            {/* Account Dropdown Menu */}
                            {isAccountOpen && (
                                <>
                                    <div
                                        onClick={() => setIsAccountOpen(false)}
                                        className="fixed inset-0 z-40" >
                                    </div>

                                    <div className="absolute right-0 mt-3 w-38 md:w-48 bg-white shadow-2xl rounded-xl border border-gray-100 md:py-2 z-50 animate-in fade-in slide-in-from-top-2">

                                        {!user ? (
                                            <div className="p-2 md:space-y-1">
                                                <button
                                                    onClick={() => {
                                                        navigate("/login");
                                                        setIsAccountOpen(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-sm font-bold bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors cursor-pointer">
                                                    {t('nav.login')}
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        navigate("/account_type");
                                                        setIsAccountOpen(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                                                    {t('nav.createAccount')}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="border-t border-gray-50 mt-1 pt-1">
                                                <div className="px-5 py-2 border-b border-gray-50 mb-1">
                                                    <p className="text-[11px] text-gray-400 uppercase tracking-wider">
                                                        {t('nav.account')}
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-800 truncate">{user.name || "User"}</p>
                                                </div>

                                                {user.role === 'vendor' ? (
                                                    <>
                                                        <p
                                                            onClick={() => {
                                                                navigate("/vendor_profile");
                                                                setIsAccountOpen(false);
                                                            }}
                                                            className="px-5 py-2 text-[13px] text-gray-600 cursor-pointer transition-colors hover:text-pink-500 hover:bg-pink-50 font-medium">
                                                            {t('nav.profile')}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p
                                                            onClick={() => { navigate("/user_profile"); setIsAccountOpen(false); }}
                                                            className="px-5 py-2 text-[13px] text-gray-600 cursor-pointer transition-colors hover:text-pink-500 hover:bg-pink-50">
                                                            {t('nav.profile')}
                                                        </p>
                                                        <p
                                                            onClick={() => { navigate("/my_orders"); setIsAccountOpen(false); }}
                                                            className="px-5 py-2 text-[13px] text-gray-600 cursor-pointer transition-colors hover:text-pink-500 hover:bg-pink-50">
                                                            {t('nav.myOrders')}
                                                        </p>
                                                        <p
                                                            onClick={() => { navigate("/wishlist"); setIsAccountOpen(false); }}
                                                            className="px-5 py-2 text-[13px] text-gray-600 cursor-pointer transition-colors hover:text-pink-500 hover:bg-pink-50">
                                                            {t('nav.wishlist')}
                                                        </p>
                                                    </>
                                                )}

                                                <p
                                                    onClick={() => {
                                                        handleLogout();
                                                        setIsAccountOpen(false);
                                                    }}
                                                    className="px-5 py-2 text-[13px] text-red-600 cursor-pointer transition-colors hover:text-red-500 hover:bg-red-50 border-t border-gray-50 mt-1">
                                                    {(isVendorPending || isUserPending) ? t('nav.loggingOut') : t('nav.logout')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <form
                    onSubmit={handleSearchSubmit}
                    ref={dropdownRef}
                    className="w-full md:flex-1 md:mx-6 lg:mx-10 order-3 md:order-2 mt-4 md:mt-0">

                    <div className="relative flex items-center bg-gray-50 rounded-2xl border border-transparent focus-within:border-pink-500 focus-within:bg-white focus-within:shadow-lg transition-all duration-300 group">

                        {/* Category Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                type="button"
                                className="flex items-center gap-2 px-3 sm:px-5 py-3 text-gray-600 font-medium text-xs sm:text-sm border-r border-gray-200 transition-colors cursor-pointer"
                            >
                                <span className='md:hidden'>{t('nav.all')}</span>
                                <span className='hidden md:flex'>{t('nav.allCategories')}</span>
                                {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                            </button>

                            {isOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsOpen(false)}>
                                    </div>

                                    {isLoading ? (
                                        <p className="p-2 text-sm text-gray-400">{t('search.loading')}</p>
                                    ) : (
                                        <div className="absolute top-full left-0 mt-2 w-40 md:w-50 bg-white shadow-2xl rounded-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            {catList.map((item, index) => (
                                                <p
                                                    key={item._id}
                                                    onClick={() => {
                                                        navigate(`/all_products/${item._id}/${item.catName}`);
                                                        setIsOpen(false)
                                                    }}
                                                    className="px-5 py-3 hover:bg-pink-50 hover:text-pink-600 cursor-pointer text-sm transition-colors border-b border-gray-50 last:border-none">
                                                    {item.catName}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Input */}
                        <input
                            type="text"
                            placeholder={t('search.placeholder')}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
                            className="w-full bg-transparent px-3 md:px-6 py-3 text-xs sm:text-sm text-gray-700 outline-none placeholder:text-gray-400"
                        />

                        {showDropdown && (suggestions.length > 0 || searchFaqs.length > 0) && (
                            <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-xl mt-2 p-4 z-50 border border-gray-100">

                                {/* Dynamic Product Section */}
                                {suggestions.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                            {t('search.products')}
                                        </p>
                                        {suggestions.map(p => (
                                            <div
                                                key={p._id}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleRedirect(p, 'product');
                                                }}
                                                className="flex items-center gap-3 py-2 hover:bg-gray-50 cursor-pointer rounded-lg px-2 group/item"
                                            >
                                                <img
                                                    src={p.prodImage}
                                                    alt={p.prodName}
                                                    className="w-10 h-10 rounded object-cover"
                                                />
                                                <div>
                                                    <h5 className="text-sm font-semibold text-gray-800 group-hover/item:text-pink-500 transition-colors">{p.prodName}</h5>
                                                    <p className="text-xs text-pink-500 font-bold">₹{p.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* FAQ Section */}
                                {searchQuery.trim().length >= 2 && searchFaqs.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                            {t('search.helpSupport')}
                                        </p>
                                        {searchFaqs.map((f, i) => (
                                            <div
                                                key={i}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleRedirect(f, 'faq');
                                                }}
                                                className="py-2 px-2 hover:bg-gray-50 cursor-pointer rounded-lg text-sm text-gray-600 flex items-center gap-2 group/faq"
                                            >
                                                <span className="text-pink-400 text-xs font-bold italic">Q:</span>
                                                <span className="group-hover/faq:text-pink-500 transition-colors">{f.question}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* No results fallback */}
                                {suggestions.length === 0 && searchFaqs.length === 0 && searchQuery.trim().length >= 2 && (
                                    <p className="text-center text-gray-400 py-4 text-sm">
                                        {t('search.noMatch')}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Search Icon / Submit Button */}
                        <button
                            type="submit"
                            className="mr-1 md:mr-2 bg-pink-500 hover:bg-pink-600 text-white p-2 md:p-2.5 rounded-xl transition-all shadow-md active:scale-95 group-hover:rotate-6 cursor-pointer shrink-0"
                        >
                            <IoIosSearch className="text-lg md:text-xl" />
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default SearchBar;