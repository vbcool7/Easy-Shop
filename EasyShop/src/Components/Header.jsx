
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { PiListHeartBold, PiHeadsetFill } from "react-icons/pi";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { RxCross2 } from "react-icons/rx";

import { useMegaMenu } from '../hook/useCategories';

function Header() {

    const navigate = useNavigate();

    const { data: menuData, isLoading, isError } = useMegaMenu();

    const [isOpen, setIsOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [isMobMenuOpen, setIsMobMenuOpen] = useState(false);

    const menus = [
        {
            name: "Home",
            path: "/"
        },
        {
            name: "About",
            path: "/about_us"
        },
        {
            name: "Blog",
            path: "/blog"
        },
        {
            name: "Contact",
            path: "/contact_us"
        },
    ];

    return (
        <section className="w-full bg-white px-4 lg:px-6">
            <div className="max-w-6xl mx-auto shadow-sm rounded-xl flex items-center my-4 bg-white overflow-visible border border-gray-100">

                {/* --- LEFT SIDE (Desktop: All Departments | Mobile: Support Section) --- */}
                <div className='w-full lg:w-[28%] relative'>

                    {/* All Departments Button - Desktop view (hide on mobile)  */}
                    <div
                        onClick={() => setIsOpen(!isOpen)}
                        className={`hidden lg:flex items-center justify-between px-6 py-4 bg-pink-500 cursor-pointer transition-all duration-300 
                    ${isOpen ? 'rounded-tl-xl' : 'rounded-l-xl hover:bg-pink-600'}`}
                    >
                        <div className='flex items-center gap-3'>
                            <PiListHeartBold className='text-xl text-white' />
                            <span className='text-sm text-white font-bold tracking-wider uppercase'>
                                All Departments
                            </span>
                        </div>
                        {isOpen ? <IoIosArrowUp className='text-white' /> : <IoIosArrowDown className='text-white' />}
                    </div>

                    {/* Mobile View: Support Section + Hamburger */}
                    <div className='flex lg:hidden items-center justify-between w-full px-4 py-3'>
                        <div className='flex items-center gap-3'>
                            <PiHeadsetFill className='text-pink-500 text-2xl' />
                            <div className='text-[10px] font-bold leading-tight'>
                                <p className='text-gray-400'>CALL US 24/7</p>
                                <p className='text-pink-600 text-[12px]'>+11 222 333 444</p>
                            </div>
                        </div>

                        {/* Hamburger Icon */}
                        <div
                            onClick={() => setIsMobMenuOpen(!isMobMenuOpen)}
                            className='cursor-pointer p-1 text-2xl'
                        >
                            {isMobMenuOpen ? <RxCross2 /> : <HiOutlineMenuAlt3 />}
                        </div>

                        {isMobMenuOpen && (
                            <div className="absolute top-full left-0 w-full z-110 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="w-full bg-white shadow-2xl border border-gray-100 rounded-xl overflow-hidden">
                                    {/* Navigation Links Section */}
                                    <nav className="flex flex-col bg-white">
                                        {menus.map((item, index) => (
                                            <NavLink
                                                key={index}
                                                to={item.path}
                                                onClick={() => setIsMobMenuOpen(false)}

                                                className={({ isActive }) => `px-8 py-3 text-[15px] font-bold cursor-pointer transition-colors
                                                        ${isActive ? 'text-pink-500' : 'hover:text-pink-500 text-gray-600'}`}>
                                                {item.name}
                                            </NavLink>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dropdown Mega Menu */}
                    {isOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsOpen(false)}>
                            </div>

                            <div className="absolute left-0 top-full w-full bg-white shadow-2xl border-x border-b border-gray-100 rounded-b-xl z-100 animate-in fade-in slide-in-from-top-2">
                                {menuData?.map((category, index) => (
                                    <div
                                        key={category._id}
                                        onMouseEnter={() => setActiveMenu(index)}
                                        onMouseLeave={() => setActiveMenu(null)}
                                        className='flex items-center justify-between px-6 py-3 hover:bg-pink-50 hover:text-pink-600 cursor-pointer transition-colors group'
                                    >
                                        <p className="text-[13px] font-medium text-gray-700 group-hover:translate-x-1 transition-transform">
                                            {category.catName}
                                        </p>

                                        {category.subcategories?.length > 0 && (
                                            <span className='text-xs text-gray-400 group-hover:text-pink-500'>
                                                <MdOutlineArrowForwardIos />
                                            </span>
                                        )}

                                        {/* Mega Menu Content */}
                                        {activeMenu === index && category.subcategories?.length > 0 && (
                                            <div className="absolute left-full top-0 w-207.5 bg-white p-8 shadow-2xl border-l border-pink-100 z-110 rounded-r-xl animate-in fade-in slide-in-from-left-2 duration-200">

                                                <div className="grid grid-cols-3 gap-10">
                                                    {category.subcategories.slice(0, 6).map((sub) => (
                                                        <div
                                                            key={sub._id}
                                                            className="space-y-4">

                                                            <div>
                                                                <h1 className="text-[15px] font-bold pb-2 border-b border-gray-100 text-pink-600 uppercase tracking-tight">
                                                                    {sub.subCatName}
                                                                </h1>

                                                                <div className="mt-1 flex flex-col space-y-2">
                                                                    {sub.allowedAttributes?.slice(0, 3).map((attr) => (
                                                                        <p
                                                                            key={attr._id}
                                                                            className="text-[13px] text-gray-600 hover:text-pink-500 cursor-pointer flex items-center transition-all"
                                                                            onClick={() => {
                                                                                navigate(`/all_products/${category._id}/${sub.subCatName}?subCatId=${sub._id}`);
                                                                                setIsOpen(false);
                                                                            }}
                                                                        >
                                                                            <span className="mr-2 text-[10px] text-pink-300">●</span>
                                                                            Shop by {attr.name}
                                                                        </p>
                                                                    ))}

                                                                    {/* View All */}
                                                                    <p
                                                                        className="text-[13px] font-semibold text-gray-400 hover:text-pink-600 cursor-pointer pt-1"
                                                                        onClick={() => {
                                                                            navigate(`/all_products/${category._id}/${sub.subCatName}`);
                                                                            setIsOpen(false);
                                                                        }}
                                                                    >
                                                                        Browse All products →
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {/* Right Side Panel Image Section */}
                                                    <div className="col-span-1 flex items-end ">
                                                        <img
                                                            src={category.catImage}
                                                            alt={category.catName}
                                                            className="w-full h-auto rounded-md shadow-sm object-cover aspect-4/3"
                                                        />
                                                    </div>

                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* --- RIGHT SIDE (Menus) on desktop --- */}
                <div className='hidden lg:flex w-[72%] justify-between items-center px-10'>
                    <nav className='flex gap-10 text-[13px] font-bold text-gray-600'>
                        {menus.map((item, index) => (
                            <NavLink
                                key={index}
                                to={item.path}
                                className={({ isActive }) => `relative cursor-pointer transition-colors group uppercase tracking-tighter
                                    ${isActive ? 'text-pink-500' : 'hover:text-pink-500 text-gray-600'}`}
                            >
                                {({ isActive }) => (
                                    <>
                                        {item.name}

                                        <span className={`absolute left-0 -bottom-1 h-0.5 bg-pink-500 transition-all duration-300 
                                            ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}>
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Support Section (Desktop Only) */}
                    <div className='flex items-center gap-4 bg-pink-50 px-4 py-2 rounded-full border border-pink-100'>
                        <PiHeadsetFill className='text-pink-500 text-3xl' />
                        <div className='text-[11px] font-bold leading-tight'>
                            <p className='text-gray-400'>CALL US 24/7</p>
                            <p className='text-pink-600 text-[13px]'>+11 222 333 444</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );

}

export default Header;