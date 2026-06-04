
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Menu, Search, Sun, Bell, ChevronDown, User, LogOut, UserRoundCog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import useAuthStore, { useVendorUIStore } from '../../store/useAuthStore';
import { useVendorLogout } from '../../hook/useAuth';
import { useGetVendor, useVendorSearch } from '../../hook/useVendor';
import NotificationBellIcon from './NotificationBellIcon';
import VendorLangSwitcher from './VendorLangSwitcher';
import { useTranslation } from 'react-i18next';

const VendorHeader = ({ onToggleSideBar, setCurrentPage }) => {

    const { t } = useTranslation();
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);

    const { data: getVendor, isLoading, isError } = useGetVendor();
    const { data: searchData } = useVendorSearch(debouncedQuery);
    const { mutate: logoutVendor, isPending } = useVendorLogout();
    const { openProductDrawer, openOrderDrawer } = useVendorUIStore();

    const clearStore = useAuthStore((state) => state.logout);

    // Debounce
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // logout
    const handleLogout = () => {
        logoutVendor(null, {
            onSuccess: (res) => {
                clearStore();
                navigate('/login')
                toast.success(res.message || "Logout successful!");
            },
            onError: (error) => {
                clearStore();
            }
        });
    };

    return (
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-pink-50 dark:border-slate-800 p-4 lg:px-8 sticky top-0 z-40'>
            <div className='flex items-center justify-between gap-2 lg:gap-4'>

                {/* Left: Branding/Toggle */}
                <div className='flex items-center space-x-4'>
                    <button
                        onClick={onToggleSideBar}
                        className='p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-90'
                    >
                        <Menu className='w-6 h-6 text-pink-500' />
                    </button>

                    <div className='hidden lg:block'>
                        <h1 className='text-lg md:text-xl font-bold bg-linear-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent'>
                            {t('vendorHeader.vendor')}
                        </h1>
                        <p className='text-[11px] md:text-xs text-slate-400 font-medium tracking-wide uppercase'>
                            {t('vendorHeader.sellerCentral')}
                        </p>
                    </div>
                </div>

                {/* Center: Search Bar */}
                <div className='flex-1 max-w-md hidden sm:block'>
                    <div
                        className='relative group'
                        ref={searchRef}>
                        <Search className='w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-500 transition-colors' />

                        <input
                            type='text'
                            placeholder={t('vendorHeader.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchOpen(true)}
                            className='w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-pink-500/20 focus:border-pink-500 transition-all placeholder:text-slate-400'
                        />

                        {/* Dropdown */}
                        {searchOpen && debouncedQuery.length >= 2 && (
                            <div className='absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-200/50 z-50 overflow-hidden'>

                                {isLoading && (
                                    <p className='text-xs text-slate-400 px-4 py-3'>
                                        {t('vendorHeader.searching')}
                                    </p>
                                )}

                                {!isLoading && searchData?.products?.length === 0 && searchData?.orders?.length === 0 && (
                                    <p className='text-xs text-slate-400 px-4 py-3'>
                                        {t('vendorHeader.noResults')}
                                    </p>
                                )}

                                {/* Products */}
                                {searchData?.products?.length > 0 && (
                                    <div>
                                        <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-1'>
                                            {t('vendorHeader.products')}
                                        </p>
                                        {searchData.products.map((product) => (
                                            <div
                                                key={product._id}
                                                onClick={() => {
                                                    openProductDrawer(product);
                                                    setCurrentPage('All Products');
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
                                                    {product.status === 'Approved' ? t('vendorHeader.statusApproved') :
                                                        product.status === 'Pending' ? t('vendorHeader.statusPending') :
                                                            t('vendorHeader.statusRejected')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Orders */}
                                {searchData?.orders?.length > 0 && (
                                    <div>
                                        <p className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-1'>
                                            {t('vendorHeader.orders')}
                                        </p>
                                        {searchData.orders.map((order) => (
                                            <div
                                                key={order._id}
                                                onClick={() => {
                                                    openOrderDrawer(order._id);
                                                    setCurrentPage('Orders');
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
                                                    {order.orderStatus === 'Delivered' ? t('vendorHeader.statusDelivered') :
                                                        order.orderStatus === 'Shipped' ? t('vendorHeader.statusShipped') :
                                                            order.orderStatus === 'Cancelled' ? t('vendorHeader.statusCancelled') :
                                                                t('vendorHeader.statusProcessing')}
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

                {/* Right: Actions & Profile */}
                <div className='flex items-center space-x-2 lg:space-x-4'>

                    {/* Theme Toggle */}
                    <button className='md:ml-0 p-2.5 rounded-xl text-slate-500 hover:bg-pink-50 dark:hover:bg-slate-800 transition-all'>
                        <Sun className='w-5 h-5 hover:rotate-45 transition-transform' />
                    </button>

                    <VendorLangSwitcher />

                    {/* notification */}
                    <div className='relative'>
                        <NotificationBellIcon setCurrentPage={setCurrentPage} />
                    </div>

                    {/* User Profile */}
                    <div className='relative' ref={dropdownRef}>
                        <div
                            onClick={() => setOpen(!open)}
                            className='flex items-center space-x-3 p-1 pr-3 rounded-2xl border border-transparent hover:border-pink-100 hover:bg-pink-50/50 transition-all cursor-pointer'
                        >

                            <div className='w-9 h-9 bg-linear-to-br from-pink-500 to-rose-400 rounded-xl flex justify-center items-center shadow-md shadow-pink-200'>
                                {getVendor?.profilePhoto ? (
                                    <img
                                        src={getVendor.profilePhoto}
                                        className="w-full h-full rounded-xl object-cover" />
                                ) : (
                                    <User className='w-5 h-5 text-white' />
                                )}
                            </div>

                            <div className='hidden md:block text-left'>
                                <h4 className='text-xs font-bold text-slate-800 dark:text-white leading-tight'>
                                    {getVendor?.name || t('vendorHeader.loading')}
                                </h4>
                                <span className='text-[10px] font-semibold text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded-md'>
                                    {t('vendorHeader.verified')}
                                </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 
                                ${open ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Enhanced Dropdown */}
                        {open && (
                            <div className="absolute right-0 mt-3 w-35 md:w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-200/50 z-50 py-1 md:py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                                <button
                                    onClick={() => {
                                        navigate("/vendor_profile");
                                        setOpen(false);
                                    }}
                                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-700/50 hover:text-pink-600 transition-colors cursor-pointer">
                                    <UserRoundCog className="w-4 h-4" />
                                    <span>{t('vendorHeader.profile')}</span>
                                </button>

                                <div className='h-px bg-slate-100 dark:bg-slate-700 mx-2 my-1'></div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                                    <LogOut className="w-4 h-4" />
                                    <span className='font-semibold'>{t('vendorHeader.logout')}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorHeader;