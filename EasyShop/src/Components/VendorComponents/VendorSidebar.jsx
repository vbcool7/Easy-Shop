
import React, { useState } from "react";
import Logo from '../../assets/Images/Logo.png';
import { Link } from 'react-router-dom';
import { MdOutlineDashboard } from "react-icons/md";
import { AiOutlineProduct } from "react-icons/ai";
import { PiShoppingCartSimple, PiHandCoins } from "react-icons/pi";
import { TbUsers, TbSettings } from "react-icons/tb";
import { TiStarOutline } from "react-icons/ti";
import { BiSolidCategory } from "react-icons/bi";
import { ChevronDown, BadgePercent, User } from 'lucide-react';
import { HiOutlineChatAlt2 } from "react-icons/hi";
import { BookOpen } from 'lucide-react';

import { useGetVendor } from "../../hook/useVendor";
import { useVendorUnreadCount } from "../../hook/useChat";
import useAuthStore from "../../store/useAuthStore";
import { useTranslation } from "react-i18next";

function VendorSidebar({ collapsed, onToggle, currentPage, onPageChange, mobileOpen, onCloseMobile }) {

    const { t } = useTranslation();
    const { user } = useAuthStore();
    const vendorId = user?._id || user?.id;

    const { data: unreadCount } = useVendorUnreadCount(vendorId);
    const { data: getVendor, isLoading, isError } = useGetVendor();

    const [expandedItems, setExpandedItems] = useState(new Set(['categories']));

    const menuItems = [
        {
            id: "Vendor Dashboard",
            icon: <MdOutlineDashboard className='w-6 h-6' />,
            label: t('sidebar.dashboard', 'Vendor Dashboard'),
            active: true,
        },
        {
            id: "Products",
            icon: <AiOutlineProduct className='w-6 h-6' />,
            label: t('sidebar.productsManagement', 'Products Management'),
            active: true,
            submenu: [
                { id: "All Products", label: t('sidebar.allProducts', 'All Products') },
                { id: "Add Product", label: t('sidebar.addNewProduct', 'Add New Product') },
                { id: "Inventory", label: t('sidebar.stockInventory', 'Stock Inventory') }
            ],
        },
        {
            id: "blog",
            icon: <BookOpen className='w-6 h-6' />,
            label: t('sidebar.blogManagement', 'Blog Management'),
            submenu: [
                { id: "blogs", label: t('sidebar.blogList', 'Blog List') },
                { id: "create-blog", label: t('sidebar.addBlog', 'Add Blog') },
            ]
        },
        {
            id: "Orders",
            icon: <PiShoppingCartSimple className='w-6 h-6' />,
            label: t('sidebar.orders', 'Orders'),
            active: true,
            Badge: "12"
        },
        {
            id: "Earnings",
            icon: <PiHandCoins className='w-6 h-6' />,
            label: t('sidebar.earningsPayouts', 'Earnings & Payouts'),
            active: true,
            submenu: [
                { id: "Transactions", label: t('sidebar.transactions', 'Transactions') },
                { id: "Withdrawals", label: t('sidebar.withdrawRequests', 'Withdraw Requests') }
            ]
        },
        {
            id: "Customers",
            icon: <TbUsers className='w-6 h-6' />,
            label: t('sidebar.myCustomers', 'My Customers'),
            active: true,
        },
        {
            id: "Messages",
            icon: <HiOutlineChatAlt2 className='w-6 h-6' />,
            label: t('sidebar.customerChats', 'Customer Chats'),
            active: true,
            Badge: "5"
        },
        {
            id: "Review",
            icon: <TiStarOutline className='w-6 h-6' />,
            label: t('sidebar.reviewRating', 'Review And Rating'),
            active: true,
            Badge: t('sidebar.badgeNew', 'New')
        },
    ];

    const toggleEcpanded = (itemid) => {
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
                <Link to="/" className='flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity'>
                    <img
                        src={Logo}
                        alt="EasyShop"
                        className={`${collapsed ? 'md:w-10' : 'w-25'} w-25 object-contain transition-all duration-300`}
                    />
                </Link>

                <button
                    onClick={onCloseMobile}
                    className="rounded-xl p-2 text-slate-500 transition-all hover:bg-pink-50 lg:hidden"
                >
                    ✕
                </button>
            </div>

            {/* Navigation Menu */}
            <nav className='flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar'>
                {menuItems.map((item) => {
                    const isActive = currentPage === item.id;
                    const isExpanded = expandedItems.has(item.id);

                    return (
                        <div
                            key={item.id}
                            className="group">

                            <button
                                className={`w-full flex items-center ${collapsed ? "justify-center" : "justify-between"} p-3 rounded-2xl transition-all cursor-pointer duration-300 
                                    ${isActive
                                        ? "bg-linear-to-r from-pink-500 to-rose-400 text-white shadow-lg shadow-pink-200"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-800/50 hover:text-pink-600"
                                    }`}
                                onClick={() => {
                                    if (collapsed) {
                                        onToggle();
                                        return;
                                    }
                                    if (item.submenu) {
                                        toggleEcpanded(item.id);
                                    } else {
                                        onPageChange(item.id);
                                    }
                                }}
                            >
                                <div className='flex items-center space-x-3'>
                                    <div className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-pink-500"} transition-colors`}>
                                        {item.icon}
                                    </div>

                                    {!collapsed && (
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold tracking-wide text-sm`}>
                                                {item.label}
                                            </span>

                                            {/* badge */}
                                            {item.Badge && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold bg-pink-100 text-pink-600 border border-pink-200`}>
                                                    {item.id === 'Messages'
                                                        ? (unreadCount || 0)
                                                        : item.Badge}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {!collapsed && item.submenu && (
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                )}
                            </button>

                            {/* Sub Menu with Animation */}
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

            {/* Footer / Profile Section */}
            <div className='mb-2 px-4 border-t border-pink-50 dark:border-slate-800'>
                <div className={`flex items-center ${collapsed ? "justify-center" : "space-x-3 p-3"} rounded-2xl bg-slate-50 dark:bg-slate-800/40 transition-all`}>
                    <div className="relative">
                        <div className='w-10 h-10 bg-linear-to-br from-pink-500 to-rose-400 rounded-xl flex justify-center items-center shadow-md shadow-pink-200'>
                            {getVendor?.profilePhoto ? (
                                <img
                                    src={getVendor.profilePhoto}
                                    className="w-full h-full rounded-xl object-cover" />
                            ) : (
                                <User className='w-5 h-5 text-white' />
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                    </div>

                    {!collapsed && (
                        <div className='flex-1 min-w-0'>
                            <h1 className='text-xs md:text-sm font-bold text-slate-800 dark:text-white truncate'>
                                {t('sidebar.vendorName', 'EasyShop Vendor')}
                            </h1>
                            <p className='text-[8px] md:text-[10px] font-bold text-pink-500 uppercase tracking-tighter'>
                                {t('sidebar.vendorBadge', 'Premium Seller')}
                            </p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}

export default VendorSidebar;