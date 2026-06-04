
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Menu, Search, Sun, Bell, ChevronDown, User, LogOut, UserRoundCog, ShieldCheck } from 'lucide-react';

import useAdminAuthStore, { useAdminUIStore } from '../store/useAdminAuthStore';
import { useAdminLogout, useAdminSearch } from '../hooks/useAdminAuth';
import { useGetAdmin } from '../hooks/useAdminStats';
import NotificationBellIcon from './NotificationBellIcon';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Header = ({ onToggleSideBar, setCurrentPage }) => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);
    const [open, setOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);

    const { data: getAdmin, isError } = useGetAdmin();
    const { mutate: logoutAdmin, isPending } = useAdminLogout();
    const { data: searchData, isLoading: isSearchLoading } = useAdminSearch(debouncedQuery);
    const { openProductDrawer, openOrderDrawer } = useAdminUIStore();

    const clearStore = useAdminAuthStore((state) => state.logout);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        logoutAdmin(null, {
            onSuccess: (res) => {
                clearStore();
                navigate('/admin-login')
                toast.success(res.message || "Logout successful!");
            },
            onError: (error) => {
                clearStore();
            }
        });
    };

    return (
        <div className="sticky top-0 z-40 border-b border-pink-50 bg-white/80 p-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 sm:p-4 lg:px-8">
            <div className="flex min-w-0 items-center justify-between gap-2 lg:gap-4">

                {/* Left: Branding & Sidebar Toggle */}
                <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                    <button
                        onClick={onToggleSideBar}
                        className='p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-90'
                    >
                        <Menu className='w-6 h-6 text-pink-500' />
                    </button>

                    <div className='hidden lg:block'>
                        <h1 className='text-lg md:text-xl font-bold bg-linear-to-r from-pink-600 to-rose-400 bg-clip-text text-transparent'>
                            {t('adminHeader.panel')}
                        </h1>
                        <p className='text-[11px] md:text-xs text-slate-400 font-medium tracking-wide uppercase'>
                            {t('adminHeader.central')}
                        </p>
                    </div>
                </div>

                {/* Center: Search Bar */}
                <div className="hidden min-w-0 flex-1 sm:block lg:max-w-md">
                    <div className='relative group' ref={searchRef}>
                        <Search className='w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors' />
                        <input
                            type='text'
                            placeholder={t('adminHeader.placeholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchOpen(true)}
                            className="w-full min-w-0 rounded-2xl border border-slate-100 bg-slate-50 py-2.5 pl-11 pr-4 text-sm transition-all placeholder:text-slate-400 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500/20 dark:border-slate-700 dark:bg-slate-800/50"
                        />

                        {/* Dropdown */}
                        {searchOpen && debouncedQuery.length >= 2 && (
                            <div className='absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-200/50 z-50 overflow-hidden'>

                                {isSearchLoading && (
                                    <p className='text-xs text-slate-400 px-4 py-3'>{t('adminHeader.searching')}</p>
                                )}

                                {!isSearchLoading && searchData?.products?.length === 0 && searchData?.orders?.length === 0 && (
                                    <p className='text-xs text-slate-400 px-4 py-3'>{t('adminHeader.noResults')}</p>
                                )}

                                {/* Products */}
                                {searchData?.products?.length > 0 && (
                                    <div>
                                        <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-1'>
                                            {t('adminHeader.products')}
                                        </p>
                                        {searchData.products.map((product) => (
                                            <div
                                                key={product._id}
                                                onClick={() => {
                                                    openProductDrawer(product);
                                                    setCurrentPage('all-products');
                                                    setSearchOpen(false);
                                                    setSearchQuery('');
                                                }}
                                                className='flex items-center gap-3 px-4 py-2.5 hover:bg-pink-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors'
                                            >
                                                <img
                                                    src={product.prodImage}
                                                    className='w-8 h-8 rounded-lg object-cover border border-slate-100'
                                                />
                                                <div className='flex-1 min-w-0'>
                                                    <p className='text-sm font-medium text-slate-700 dark:text-white truncate'>
                                                        {product.prodName}
                                                    </p>
                                                    <p className='text-[11px] text-slate-400'>₹{product.price}</p>
                                                </div>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                                            ${product.status === 'Approved' ? 'bg-green-50 text-green-600' :
                                                        product.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
                                                            'bg-red-50 text-red-500'}`}>
                                                    {product.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Orders */}
                                {searchData?.orders?.length > 0 && (
                                    <div>
                                        <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-1'>
                                            {t('adminHeader.orders')}
                                        </p>
                                        {searchData.orders.map((order) => (
                                            <div
                                                key={order._id}
                                                onClick={() => {
                                                    openOrderDrawer(order);
                                                    setCurrentPage('platform-orders');
                                                    setSearchOpen(false);
                                                    setSearchQuery('');
                                                }}
                                                className='flex items-center gap-3 px-4 py-2.5 hover:bg-pink-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors'
                                            >
                                                <div className='flex-1 min-w-0'>
                                                    <p className='text-sm font-medium text-slate-700 dark:text-white truncate'>
                                                        {order.shippingAddress?.name}
                                                    </p>
                                                    <p className='text-[11px] text-slate-400'>₹{order.totalAmount}</p>
                                                </div>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                                            ${order.orderStatus === 'Delivered' ? 'bg-green-50 text-green-600' :
                                                        order.orderStatus === 'Shipped' ? 'bg-blue-50 text-blue-600' :
                                                            order.orderStatus === 'Cancelled' ? 'bg-red-50 text-red-500' :
                                                                'bg-yellow-50 text-yellow-600'}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className='h-3' />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Area: Actions & Profile */}
                <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-4">
                    <button className='p-2.5 rounded-xl text-slate-500 hover:bg-pink-50 dark:hover:bg-slate-800 transition-all'>
                        <Sun className='w-5 h-5 hover:rotate-45 transition-transform' />
                    </button>

                    {/* lang switcher */}
                    <LanguageSwitcher />

                    {/* notification */}
                    <div className='relative'>
                        <NotificationBellIcon setCurrentPage={setCurrentPage} />
                    </div>

                    {/* profile */}
                    <div className='relative' ref={dropdownRef}>
                        <div
                            onClick={() => setOpen(!open)}
                            className="flex items-center gap-2 rounded-2xl border border-transparent p-1 transition-all hover:border-pink-100 hover:bg-pink-50/50 sm:gap-3 sm:pr-3">

                            <div className='w-9 h-9 bg-linear-to-br from-pink-500 to-rose-400 rounded-xl flex justify-center items-center shadow-md shadow-pink-200'>
                                {getAdmin?.profileAdmin ? (
                                    <img
                                        src={getAdmin.profileAdmin}
                                        className="w-full h-full rounded-xl object-cover" />
                                ) : (
                                    <User className='w-5 h-5 text-white' />
                                )}
                            </div>

                            <div className="hidden max-w-32 min-w-0 text-left lg:block">
                                <h4 className="truncate text-xs font-bold uppercase leading-tight text-slate-800 dark:text-white">
                                    {getAdmin?.name || "Loading..."}
                                </h4>

                                <div className='flex items-center gap-1'>
                                    <ShieldCheck className='w-3 h-3 text-pink-500' />
                                    <span className='text-[10px] font-semibold text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded-md'>
                                        {getAdmin?.role || "SYSTEM"}
                                    </span>
                                </div>
                            </div>

                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 
                                ${open ? 'rotate-180' : ''}`} />
                        </div>

                        {open && (
                            <div className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-slate-100 bg-white py-1.5 shadow-xl shadow-slate-200/50 animate-in fade-in zoom-in duration-200 dark:border-slate-700 dark:bg-slate-800 sm:w-48">
                                <button
                                    onClick={() => handleLogout()}
                                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs font-semibold leading-tight text-red-500 transition-colors hover:bg-red-50 sm:gap-3 sm:px-4 sm:py-2.5 sm:text-sm"
                                >
                                    <LogOut className="h-4 w-4 shrink-0" />
                                    <span className="wrap-break-words">
                                        {isPending ? t('adminHeader.loggingOut') : t('adminHeader.logout')}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;