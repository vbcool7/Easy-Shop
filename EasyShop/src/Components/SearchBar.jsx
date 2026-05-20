
import React, { useState } from 'react';
import Logo from '../assets/Images/Logo.png';
import { Link } from 'react-router-dom';
import { IoIosSearch, IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FiUser } from "react-icons/fi";
import { GoHeart } from "react-icons/go";
import { PiShoppingCartSimple } from "react-icons/pi";
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { allFaqs } from './Data';
import toast from 'react-hot-toast';

import useAuthStore from '../store/useAuthStore';
import { useUserLogout, useVendorLogout } from '../hook/useAuth';
import { useCatList } from '../hook/useCategories';
import { useSearchSuggestions } from '../hook/uesProducts';
import { useQueryClient } from '@tanstack/react-query';

function SearchBar() {

    const { user } = useAuthStore();

    const { cartItems } = useCart();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

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
    const searchFaqs = allFaqs.filter(f =>
        f.question.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 2);

    // redirect
    const handleRedirect = (item, type) => {
        clearSearch();
        if (type === 'product') {
            navigate(`/product_detail/${item._id}/${item.prodName}`);
        } else if (type === 'faq') {
            navigate(`/faqs?query=${item.question}`);
        }
    };

    return (
        <section className="w-full bg-white sticky top-0 z-50 shadow-sm px-4 lg:px-6">
            <div className="max-w-6xl mx-auto flex flex-wrap md:flex-nowrap items-center py-4">

                {/* Logo Section */}
                <Link to="/" className='flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity'>
                    <div className="flex items-center order-1 w-1/2 md:w-auto hover:scale-95 active:scale-95 transition-all duration-500">
                        <img
                            src={Logo}
                            alt="Logo"
                            className="h-10 object-cover" />
                    </div>
                </Link>

                {/* wishlist, cart, acc Icons */}
                <div className="flex items-center justify-end gap-6 order-2 w-1/2 md:w-auto md:order-3">

                    <div className="flex gap-4 text-2xl text-gray-600">

                        {/* whishlist Icon */}
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

                        {/* Account Section */}
                        <div className="relative">
                            <div
                                onClick={() => setIsAccountOpen(!isAccountOpen)}
                                className="flex items-center gap-2 md:bg-gray-100 md:px-4 md:py-1.5 rounded-full cursor-pointer hover:bg-pink-50 transition-all group"
                            >
                                <FiUser className={`text-xl ${isAccountOpen ? 'text-pink-500' : 'text-gray-600'} group-hover:text-pink-500`} />
                                <span className="hidden md:flex text-sm font-semibold text-gray-700 group-hover:text-pink-500">Account</span>
                            </div>

                            {/* Account Dropdown Menu */}
                            {isAccountOpen && (
                                <>
                                    {/* when we click outside then drop down will close */}
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
                                                    Login
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        navigate("/account_type");
                                                        setIsAccountOpen(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                                                    Create Account
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="border-t border-gray-50 mt-1 pt-1">
                                                {/* Common Header: Name Section */}
                                                <div className="px-5 py-2 border-b border-gray-50 mb-1">
                                                    <p className="text-[11px] text-gray-400 uppercase tracking-wider">Account</p>
                                                    <p className="text-sm font-bold text-gray-800 truncate">{user.name || "User"}</p>
                                                </div>

                                                {/* 1. VENDOR MENUS */}
                                                {user.role === 'vendor' ? (
                                                    <>
                                                        <p
                                                            onClick={() => {
                                                                navigate("/vendor_profile");
                                                                setIsAccountOpen(false);
                                                            }}
                                                            className="px-5 py-2 text-[13px] text-gray-600 cursor-pointer transition-colors hover:text-pink-500 hover:bg-pink-50 font-medium">
                                                            Profile
                                                        </p>
                                                    </>
                                                ) : (
                                                    /* 2. REGULAR USER MENUS */
                                                    <>
                                                        <p
                                                            onClick={() => { navigate("/user_profile"); setIsAccountOpen(false); }}
                                                            className="px-5 py-2 text-[13px] text-gray-600 cursor-pointer transition-colors hover:text-pink-500 hover:bg-pink-50">
                                                            Profile
                                                        </p>
                                                        <p
                                                            onClick={() => { navigate("/my_orders"); setIsAccountOpen(false); }}
                                                            className="px-5 py-2 text-[13px] text-gray-600 cursor-pointer transition-colors hover:text-pink-500 hover:bg-pink-50">
                                                            My Orders
                                                        </p>
                                                        <p
                                                            onClick={() => { navigate("/wishlist"); setIsAccountOpen(false); }}
                                                            className="px-5 py-2 text-[13px] text-gray-600 cursor-pointer transition-colors hover:text-pink-500 hover:bg-pink-50">
                                                            Wishlist
                                                        </p>
                                                    </>
                                                )}

                                                {/* Common Footer: Logout */}
                                                <p
                                                    onClick={() => {
                                                        handleLogout();
                                                        setIsAccountOpen(false);
                                                    }}
                                                    className="px-5 py-2 text-[13px] text-red-600 cursor-pointer transition-colors hover:text-red-500 hover:bg-red-50 border-t border-gray-50 mt-1">
                                                    {(isVendorPending || isUserPending) ? "Logging out..." : "Logout"}
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
                    className="w-full md:flex-1 md:mx-10 order-3 md:order-2 mt-4 md:mt-0">

                    <div className="relative flex items-center bg-gray-50 rounded-2xl border border-transparent focus-within:border-pink-500 focus-within:bg-white focus-within:shadow-lg transition-all duration-300 group">

                        {/* Category Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex items-center gap-4 md:gap-2 px-5 py-1 md:py-3 text-gray-600 font-medium text-sm border-r border-gray-200 transition-colors cursor-pointer"
                            >
                                <span className='md:hidden'>All </span>
                                <span className='hidden md:flex'>All Categories</span>
                                {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                            </button>

                            {isOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsOpen(false)}>
                                    </div>

                                    {isLoading ? (
                                        <p className="p-2 text-sm text-gray-400">Loading...</p>
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
                            placeholder="Search for products..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
                            className="w-full bg-transparent px-4 md:px-6 py-3 text-sm text-gray-700 outline-none placeholder:text-gray-400"
                        />

                        {showDropdown && (suggestions.length > 0 || searchFaqs.length > 0) && (
                            <div className="absolute top-full left-0 w-full bg-white shadow-2xl rounded-xl mt-2 p-4 z-50 border border-gray-100">

                                {/* Dynamic Product Section from API Hook */}
                                {suggestions.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Products</p>
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
                                                    <p className="text-xs text-pink-500 font-bold">
                                                        ₹{p.price}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* FAQ Section (Stays intact but reacts to hook queries) */}
                                {searchQuery.trim().length >= 2 && searchFaqs.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Help & Support</p>
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

                                {/* No results fallback condition */}
                                {suggestions.length === 0 && searchFaqs.length === 0 && searchQuery.trim().length >= 2 && (
                                    <p className="text-center text-gray-400 py-4 text-sm">
                                        No match found. Try another keyword!
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Search Icon / Submit Button */}
                        <button
                            type="submit"
                            className="mr-1 md:mr-2 bg-pink-500 hover:bg-pink-600 text-white p-2 md:p-2.5 rounded-xl transition-all shadow-md active:scale-95 group-hover:rotate-6 cursor-pointer"
                        >
                            <IoIosSearch className="text-xl" />
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}

export default SearchBar;