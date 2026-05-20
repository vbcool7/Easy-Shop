
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

const menuItems = [
    {
        id: "Vendor Dashboard",
        icon: <MdOutlineDashboard className='w-6 h-6' />,
        label: "Vendor Dashboard",
        active: true,
    },
    {
        id: "Products",
        icon: <AiOutlineProduct className='w-6 h-6' />,
        label: "Products Management",
        active: true,
        submenu: [
            { id: "All Products", label: "All Products" },
            { id: "Add Product", label: "Add New Product" },
            { id: "Inventory", label: "Stock Inventory" }
        ],
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
        id: "Orders",
        icon: <PiShoppingCartSimple className='w-6 h-6' />,
        label: "Orders",
        active: true,
        Badge: "12"
    },
    {
        id: "Earnings",
        icon: <PiHandCoins className='w-6 h-6' />,
        label: "Earnings & Payouts",
        active: true,
        submenu: [
            { id: "Transactions", label: "Transactions" },
            { id: "Withdrawals", label: "Withdraw Requests" }
        ]
    },
    {
        id: "Customers",
        icon: <TbUsers className='w-6 h-6' />,
        label: "My Customers",
        active: true,
    },
    {
        id: "Messages",
        icon: <HiOutlineChatAlt2 className='w-6 h-6' />,
        label: "Customer Chats",
        active: true,
        Badge: "5"
    },
    {
        id: "Review",
        icon: <TiStarOutline className='w-6 h-6' />,
        label: "Review And Rating",
        active: true,
        Badge: "New"
    },
    // {
    //     id: "Promotions",
    //     icon: <BadgePercent className='w-6 h-6' />,
    //     label: "Discounts & Offers",
    //     active: true,
    // },
    // {
    //     id: "CMS",
    //     icon: <TbSettings className='w-6 h-6' />,
    //     label: "Shop Settings",
    //     active: true,
    //     submenu: [
    //         { id: "Hero CMS", label: "Home Banners" },
    //         { id: "Footer CMS", label: "Footer Info" },
    //         { id: "Shop Policy", label: "Policies" }
    //     ]
    // },
];

function VendorSidebar({ collapsed, onToggle, currentPage, onPageChange }) {

    const { user } = useAuthStore();
    const vendorId = user?._id || user?.id;

    const { data: unreadCount } = useVendorUnreadCount(vendorId);
    const { data: getVendor, isLoading, isError } = useGetVendor();

    const [expandedItems, setExpandedItems] = useState(new Set(['categories']));

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
            className={`${collapsed ? "w-20 md:w-22" : "w-68 md:w-72"} 
        shadow-lg transition-all duration-300 ease-in-out bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col relative z-10`}>

            {/* Logo Section */}
            <div className={`p-6 flex items-center 
                ${collapsed ? "justify-center" : "justify-between"} border-b border-pink-50 dark:border-slate-800`}>
                <Link to="/" className='flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity'>
                    <img
                        src={Logo}
                        alt="EasyShop"
                        className={`${collapsed ? "w-10" : "w-25"} transition-all duration-300 object-contain`}
                    />
                </Link>
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
                            <h1 className='text-sm font-bold text-slate-800 dark:text-white truncate'>EasyShop Vendor</h1>
                            <p className='text-[10px] font-bold text-pink-500 uppercase tracking-tighter'>Premium Seller</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}

export default VendorSidebar;