
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
import { BookOpen } from 'lucide-react';

import { useGetAdmin } from "../hooks/useAdminStats";

const menuItems = [
    {
        id: "admin-dashboard",
        icon: <MdOutlineDashboard className='w-6 h-6' />,
        label: "Admin Overview",
        active: true,
    },
    {
        id: "manage-vendors",
        icon: <MdOutlineStorefront className='w-6 h-6' />,
        label: "Vendors List",
        Badge: "New",
        active: false,
    },
    {
        id: "catalog",
        icon: <MdOutlineCategory className='w-6 h-6' />,
        label: "Catalog",
        submenu: [
            { id: "categories", label: "Categories" },
            { id: "add-category", label: "Add Category" },
            { id: "sub-categories", label: "Sub Categories" },
            { id: "add-sub-category", label: "Add Sub Category" },
        ]
    },
    {
        id: "all-products",
        icon: <MdOutlineShoppingBag className='w-6 h-6' />,
        label: "All Products",
        active: false,
    },
    {
        id: "blog",
        icon: <BookOpen className='w-6 h-6' />,
        label: "Blog Management",
        submenu: [
            { id: "blogs", label: "Blog List" },
            { id: "create-blog", label: "Add Blog" },
        ]
    },
    {
        id: "platform-orders",
        icon: <MdOutlineReceiptLong className='w-6 h-6' />,
        label: "Total Orders",
        active: false,
    },
    {
        id: "transactions",
        icon: <AiOutlineTransaction className='w-6 h-6' />,
        label: "Transactions",
        active: false,
    },
    {
        id: "payout-request",
        icon: <HiOutlineBanknotes className='w-6 h-6' />,
        label: "Payout Request",
        active: false,
    },
    {
        id: "customers",
        icon: <MdOutlinePeopleAlt className='w-6 h-6' />,
        label: "User Base",
        active: false,
    },
    {
        id: "review",
        icon: <TiStarOutline className='w-6 h-6' />,
        label: "Review And Rating",
        active: true,
        Badge: "New"
    },
    {
        id: "banner-management",
        icon: <MdOutlineImage className='w-6 h-6' />,
        label: "Banner Management",
        submenu: [
            { id: "banners", label: "All Banners" },
            { id: "add-banner", label: "Add Banner" },
        ]
    },
    {
        id: "cms",
        icon: <MdOutlineArticle className='w-6 h-6' />,
        label: "CMS Pages",
        submenu: [
            { id: "terms-policy", label: "Terms of Use" },
            { id: "privacy-policy", label: "Privacy Policy" },
            { id: "delivery-policy", label: "Delivery Policy" },
            { id: "exchange-policy", label: "Exchange & Return" },
        ]
    },
    // {
    //     id: "promotions",
    //     icon: <BadgePercent className='w-6 h-6' />,
    //     label: "Discounts & Offers",
    //     active: true,
    // },
    // {
    //     id: "settings",
    //     icon: <MdOutlineSettings className='w-6 h-6' />,
    //     label: "Site Settings",
    //     submenu: [
    //         { id: "logo-management", label: "Logo Management" },
    //         { id: "contact-support-info", label: "Contact Support Info" },
    //         { id: "maintenance-mode-toggle", label: "Maintenance Mode Toggle" },
    //     ],
    //     active: false,
    // },
];

function Sidebar({ collapsed, onToggle, currentPage, onPageChange }) {

    const { data: getAdmin, isLoading, isError } = useGetAdmin();

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
            className={`${collapsed ? "w-20 md:w-22" : "w-68 md:w-72"} 
            h-screen top-0 shadow-lg transition-all duration-300 ease-in-out bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col relative z-10`}>

            {/* Logo Section */}
            <div className={`p-6 flex items-center ${collapsed ? "justify-center" : "justify-between"} border-b border-pink-50 dark:border-slate-800`}>
                <div className='flex items-center gap-3'>
                    <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">E</div>
                    {!collapsed && <span className="font-bold text-xl dark:text-white">EasyShop <span className="text-pink-500 text-xs">Admin</span></span>}
                </div>
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
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
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
                                Admin
                            </h1>
                            <p className='text-[10px] font-bold text-pink-500 dark:text-pink-400 uppercase tracking-tighter'>
                                System Administrator
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Sidebar;