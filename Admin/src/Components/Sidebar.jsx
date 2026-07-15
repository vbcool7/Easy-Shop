
import React, { useState } from "react";
import { MdOutlineDashboard } from "react-icons/md";
import { MdOutlineStorefront } from "react-icons/md";
import { MdOutlineCategory } from "react-icons/md";
import { MdOutlineShoppingBag } from "react-icons/md";
import { MdOutlineReceiptLong } from "react-icons/md";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { MdOutlineSettings } from "react-icons/md";
import { TiStarOutline } from "react-icons/ti";
import { AiOutlineTransaction } from "react-icons/ai";
import { HiOutlineBanknotes } from "react-icons/hi2";
import { MdOutlineImage, MdOutlineArticle } from 'react-icons/md';

import { ChevronDown, User, BadgePercent } from 'lucide-react';
import { X } from 'lucide-react';
import { BookOpen } from 'lucide-react';

import { useGetAdmin } from "../hooks/useAdminStats";
import { useTranslation } from 'react-i18next';

function Sidebar({ collapsed, onToggle, currentPage, onPageChange, mobileOpen, onCloseMobile }) {

    const { t } = useTranslation();
    const { data: getAdmin, isLoading, isError } = useGetAdmin();

    const menuItems = [
        {
            id: "admin-dashboard",
            icon: <MdOutlineDashboard className='w-6 h-6' />,
            label: t('adminSidebar.overview'),
            active: true,
        },
        {
            id: "manage-vendors",
            icon: <MdOutlineStorefront className='w-6 h-6' />,
            label: t('adminSidebar.vendorsList'),
            Badge: t('adminSidebar.new'),
            active: false,
        },
        {
            id: "catalog",
            icon: <MdOutlineCategory className='w-6 h-6' />,
            label: t('adminSidebar.catalog'),
            submenu: [
                { id: "categories", label: t('adminSidebar.categories') },
                { id: "add-category", label: t('adminSidebar.addCategory') },
                { id: "sub-categories", label: t('adminSidebar.subCategories') },
                { id: "add-sub-category", label: t('adminSidebar.addSubCategory') },
            ]
        },
        {
            id: "all-products",
            icon: <MdOutlineShoppingBag className='w-6 h-6' />,
            label: t('adminSidebar.allProducts'),
            active: false,
        },
        {
            id: "blog",
            icon: <BookOpen className='w-6 h-6' />,
            label: t('adminSidebar.blogMgmt'),
            submenu: [
                { id: "blogs", label: t('adminSidebar.blogList') },
                { id: "create-blog", label: t('adminSidebar.addBlog') },
            ]
        },
        {
            id: "platform-orders",
            icon: <MdOutlineReceiptLong className='w-6 h-6' />,
            label: t('adminSidebar.totalOrders'),
            active: false,
        },
        {
            id: "transactions",
            icon: <AiOutlineTransaction className='w-6 h-6' />,
            label: t('adminSidebar.transactions'),
            active: false,
        },
        {
            id: "payout-request",
            icon: <HiOutlineBanknotes className='w-6 h-6' />,
            label: t('adminSidebar.payoutRequest'),
            active: false,
        },
        {
            id: "customers",
            icon: <MdOutlinePeopleAlt className='w-6 h-6' />,
            label: t('adminSidebar.userBase'),
            active: false,
        },
        {
            id: "review",
            icon: <TiStarOutline className='w-6 h-6' />,
            label: t('adminSidebar.reviews'),
            active: true,
            Badge: t('adminSidebar.new')
        },
        {
            id: "banner-management",
            icon: <MdOutlineImage className='w-6 h-6' />,
            label: t('adminSidebar.bannerMgmt'),
            submenu: [
                { id: "banners", label: t('adminSidebar.allBanners') },
                { id: "add-banner", label: t('adminSidebar.addBanner') },
            ]
        },
        {
            id: "cms",
            icon: <MdOutlineArticle className='w-6 h-6' />,
            label: t('adminSidebar.cmsPages'),
            submenu: [
                { id: "terms-policy", label: t('adminSidebar.terms') },
                { id: "privacy-policy", label: t('adminSidebar.privacy') },
                { id: "delivery-policy", label: t('adminSidebar.delivery') },
                { id: "exchange-policy", label: t('adminSidebar.exchange') },
            ]
        },
    ];

    const [expandedItems, setExpandedItems] = useState(new Set(['']));

    const toggleExpanded = (itemid) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(itemid)) {
            newExpanded.delete(itemid);
        } else {
            newExpanded.add(itemid);
        }
        setExpandedItems(newExpanded);
    };

    return (
        <div
            className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/50 bg-white/95 shadow-xl backdrop-blur-xl transition-transform duration-300 ease-in-out dark:border-slate-700/50 dark:bg-slate-900/95
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}

            lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-lg
            ${collapsed ? 'lg:w-20' : 'lg:w-72'}
        `}
        >

            {/* Logo Section */}
            <div className={`flex items-center border-b border-pink-50 p-6 dark:border-slate-800 
            ${collapsed ? 'md:justify-center' : 'justify-between'
                }`}>

                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-500 text-xl font-bold text-white">
                        E
                    </div>

                    {!collapsed && (
                        <span className="min-w-0 wrap-break-words text-xl font-bold leading-tight dark:text-white">
                            EasyShop{' '}
                            <span className="text-xs text-pink-500">
                                {t('adminSidebar.adminLabel')}
                            </span>
                        </span>
                    )}
                </div>

                <button
                    onClick={onCloseMobile}
                    className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-pink-50 hover:text-pink-500 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
                    aria-label="Close sidebar"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Navigation Menu */}
            <nav className='flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar'>
                {menuItems.map((item) => {
                    const isActive = currentPage === item.id || (item.submenu && item.submenu.some(sub => sub.id === currentPage));
                    const isExpanded = expandedItems.has(item.id);

                    return (
                        <div key={item.id} className="group">
                            <button
                                className={`w-full flex items-center ${collapsed ? "justify-center" : "justify-between"} p-3 rounded-2xl transition-all cursor-pointer duration-300 
                                ${isActive && !item.submenu
                                        ? "bg-linear-to-r from-pink-500 to-rose-400 text-white shadow-lg shadow-pink-200"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800/50 hover:text-pink-600"
                                    }`}
                                onClick={() => {
                                    if (collapsed) {
                                        onToggle();
                                        return;
                                    }
                                    if (item.submenu) {
                                        toggleExpanded(item.id);
                                    } else {
                                        onPageChange(item.id);
                                    }
                                }}
                            >
                                <div className='flex items-center space-x-3'>
                                    <div className={`${(isActive && !item.submenu) ? "text-white" : "text-slate-400 group-hover:text-pink-500"} transition-colors`}>
                                        {item.icon}
                                    </div>

                                    {!collapsed && (
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold tracking-wide text-sm`}>
                                                {item.label}
                                            </span>
                                            {item.Badge && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold bg-pink-100 text-pink-600 border border-pink-200`}>
                                                    {item.Badge}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {!collapsed && item.submenu && (
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 
                                        ${isExpanded ? 'rotate-180' : ''}`} />
                                )}
                            </button>

                            {/* Sub Menu */}
                            {!collapsed && item.submenu && isExpanded && (
                                <div className='ml-12 mt-2 space-y-1 border-l-2 border-pink-100 dark:border-slate-800 pl-4 animate-in slide-in-from-top-2 duration-300'>
                                    {item.submenu.map((subitem, index) => (
                                        <button
                                            key={index}
                                            onClick={() => onPageChange(subitem.id)}
                                            className={`w-full text-left p-2.5 text-sm font-medium rounded-xl transition-all cursor-pointer
                                        ${currentPage === subitem.id
                                                    ? "text-pink-600 bg-pink-50/50 dark:bg-pink-900/10"
                                                    : "text-slate-500 hover:text-pink-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                }`}
                                        >
                                            {subitem.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer / Admin Profile Section */}
            <div className='mb-2 px-4 border-t border-pink-50 dark:border-slate-800'>
                <div className={`flex items-center ${collapsed ? "justify-center" : "space-x-3 p-3"} rounded-2xl bg-pink-50/50 dark:bg-slate-800/40 transition-all mt-4 border border-pink-100/50 dark:border-slate-700/30`}>
                    <div className="relative">
                        {/* Avatar with Indigo-Violet Gradient */}

                        <div className='w-9 h-9 bg-linear-to-br from-pink-500 to-rose-400 rounded-xl flex justify-center items-center shadow-md shadow-pink-200'>
                            {getAdmin?.profileAdmin ? (
                                <img
                                    src={getAdmin.profileAdmin}
                                    className="w-full h-full rounded-xl object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-linear-to-r from-pink-500 to-rose-400 flex justify-center items-center shadow-md shadow-indigo-100 dark:shadow-none overflow-hidden text-white">
                                    <User className="w-6 h-6" />
                                </div>
                            )}
                        </div>

                        {/* Status Indicator */}
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-600 border-2 border-white dark:border-slate-900 rounded-full"></div>
                    </div>

                    {!collapsed && (
                        <div className='flex-1 min-w-0'>
                            <h1 className='text-sm font-bold text-slate-800 dark:text-white truncate'>
                                {t('adminSidebar.admin')}
                            </h1>
                            <p className='text-[10px] font-bold text-pink-500 dark:text-pink-400 uppercase tracking-tighter'>
                                {t('adminSidebar.role')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Sidebar;