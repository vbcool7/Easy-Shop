
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineChevronRight } from "react-icons/hi";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { HiOutlineHeart } from "react-icons/hi";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { MdOutlineStarOutline } from "react-icons/md";
import UserProfilePersonal from './UserProfilePersonal';
import UserProfileSecurity from './UserProfileSecurity';
import UserProfileMyOrders from './UserProfileMyOrders';
import UserProfileWishList from './UserProfileWishList';

import useAuthStore from '../../store/useAuthStore';
import { useUpdateUserProfile, useUserProfile } from '../../hook/useAuth';
import UserProfileMyReviews from './UserProfileMyReviews';
import { useTranslation } from 'react-i18next';

// 1. Sidebar Menu
const menuItems = [
    { id: 'Profile', labelKey: 'profile.menuProfile', icon: <HiOutlineUser size={20} /> },
    { id: 'Orders', labelKey: 'profile.menuOrders', icon: <HiOutlineShoppingBag size={20} /> },
    { id: 'Reviews', labelKey: 'profile.menuReviews', icon: <MdOutlineStarOutline size={20} /> },
    { id: 'Wishlist', labelKey: 'profile.menuWishlist', icon: <HiOutlineHeart size={20} /> },
    { id: 'Security', labelKey: 'profile.menuSecurity', icon: <HiOutlineLockClosed size={20} /> },
    { id: 'Logout', labelKey: 'profile.menuLogout', icon: <RiLogoutCircleRLine size={20} className='rotate-270' /> },
];

function UserProfileLayout() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Profile');
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    const { user } = useAuthStore();
    const logout = useAuthStore((state) => state.logout);

    const userId = user?._id || user?.id;

    const { data: userData, isLoading, isError } = useUserProfile(userId);
    const { mutate: updateProfile, isPending } = useUpdateUserProfile(userId);

    const handleFormSubmit = (formData, callbacks) => {
        updateProfile(formData, callbacks);
    };

    const handleMenuClick = (id) => {
        if (id === 'Logout') {
            setIsLogoutOpen(true);
        } else {
            setActiveTab(id);
        }
    };

    if (isLoading) return <div className='p-6 text-center text-slate-500'>{t('profile.loading')}</div>;

    const activeItem = menuItems.find(i => i.id === activeTab);

    return (
        <div className='py-10 bg-slate-50/50 min-h-screen'>
            <div className='max-w-6xl mx-auto flex flex-col md:flex-row gap-8'>

                {/* --- LEFT SIDE: Internal Sidebar --- */}
                <div className='w-full md:w-80 shrink-0'>
                    <div className='bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 space-y-2'>

                        {/* Heading */}
                        <h3 className='px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest'>
                            {t('profile.accountMenu')}
                        </h3>

                        {/* Menus Loop */}
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => handleMenuClick(item.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group cursor-pointer
                                        ${activeTab === item.id
                                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-100'
                                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                <div className={`flex items-center gap-3 ${item.id === "Logout" ? "text-red-500 " : ""}`}>
                                    {item.icon}
                        
                                    <span className={`text-sm font-bold ${item.id === "Logout" ? "text-red-500" : ""}`}>
                                        {t(item.labelKey)}
                                    </span>
                                </div>
                                <HiOutlineChevronRight
                                    className={`transition-transform duration-300 
                                    ${activeTab === item.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`}
                                />
                            </button>
                        ))}

                    </div>
                </div>

                {/* --- RIGHT SIDE --- */}
                <div className='flex-1'>
                    <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 '>

                        {/* Form Header */}
                        <div className='p-6 border-b border-slate-50 dark:border-slate-800 bg-linear-to-r from-slate-50 to-transparent dark:from-slate-800/50'>
                    
                            <h1 className='text-lg md:text-xl font-black text-pink-500 dark:text-white uppercase tracking-tight'>
                                {activeItem ? t(activeItem.labelKey) : ""}
                            </h1>

                            <p className='text-[10px] md:text-[11px] text-slate-400 font-medium uppercase mt-1'>
                                {activeTab === 'Profile' && t('profile.descProfile')}
                                {activeTab === 'Orders' && t('profile.descOrders')}
                                {activeTab === 'Wishlist' && t('profile.descWishlist')}
                                {activeTab === 'Reviews' && t('profile.descReviews')}
                                {activeTab === 'Security' && t('profile.descSecurity')}
                            </p>
                        </div>

                        {/* Render Content Based on Active Tab */}
                        <div className='p-6 md:p-8'>
                            {activeTab === 'Profile' && (
                                <UserProfilePersonal
                                    userData={userData}
                                    onSubmit={handleFormSubmit}
                                    isPending={isPending}
                                />
                            )}

                            {activeTab === 'Orders' && <UserProfileMyOrders />}
                            {activeTab === 'Reviews' && <UserProfileMyReviews />}
                            {activeTab === 'Wishlist' && <UserProfileWishList />}

                            {activeTab === 'Security' && (
                                <UserProfileSecurity
                                    userData={userData}
                                    isPending={isPending}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Logout Popup Modal */}
            {isLogoutOpen && (
                <div className="fixed inset-0 z-999 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 w-[90%] max-w-sm text-center transform animate-in zoom-in-95 duration-300">

                        <div className="w-16 h-16 bg-pink-50 dark:bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <RiLogoutCircleRLine size={30} className="text-pink-500 rotate-270" />
                        </div>

                        {/* FIXED: Modal Translations */}
                        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                            {t('profile.logoutTitle')}
                        </h2>
                        <p className="text-slate-400 text-xs font-medium uppercase mt-2 leading-relaxed">
                            {t('profile.logoutMessage')} <span className="text-pink-500">EasyShop</span>?
                        </p>

                        <div className="flex gap-4 mt-10">
                            <button
                                onClick={() => setIsLogoutOpen(false)}
                                className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 cursor-pointer">
                                {t('profile.logoutCancel')}
                            </button>

                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/login');
                                }}
                                className="flex-1 py-4 bg-pink-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-pink-200 dark:shadow-none hover:bg-pink-600 transition-all active:scale-95 cursor-pointer">
                                {t('profile.logoutConfirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserProfileLayout;