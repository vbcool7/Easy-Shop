
import { useRef, useState, useEffect } from 'react';
import { Bell, BellRing, Check, CheckCheck, Package, Star, AlertTriangle, Wallet, X, ArrowLeftRight, ShoppingBag } from 'lucide-react';

import { io } from "socket.io-client";
import { useGetNotification, useMarkAllReadNotification, useMarkSingleReadNotification } from '../../hook/useNotification';
import useAuthStore, { useVendorUIStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';

const TYPE_CONFIG = {
    NEW_ORDER: {
        icon: Package,
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-500/10',
    },
    NEW_REVIEW: {
        icon: Star,
        color: 'text-yellow-500',
        bg: 'bg-yellow-50 dark:bg-yellow-500/10',
    },
    LOW_STOCK: {
        icon: AlertTriangle,
        color: 'text-orange-500',
        bg: 'bg-orange-50 dark:bg-orange-500/10',
    },
    PRODUCT_UPDATE: {
        icon: ShoppingBag,
        color: 'text-violet-500',
        bg: 'bg-violet-50 dark:bg-violet-500/10'
    },
    TRANSACTION_UPDATE: {
        icon: ArrowLeftRight,
        color: 'text-purple-500',
        bg: 'bg-purple-50 dark:bg-purple-500/10',
    },
    WITHDRAWAL_UPDATE: {
        icon: Wallet,
        color: 'text-green-500',
        bg: 'bg-green-50 dark:bg-green-500/10',
    },
};

const getRedirectPage = (type) => {
    switch (type) {
        case 'NEW_ORDER': return 'Orders';
        case 'NEW_REVIEW': return 'Review';
        case 'LOW_STOCK': return 'All Products';
        case 'PRODUCT_UPDATE': return 'All Products';
        case 'TRANSACTION_UPDATE': return 'Transactions';
        case 'WITHDRAWAL_UPDATE': return 'Withdrawals';
        default: return null;
    }
};

function NotificationBellIcon({ setCurrentPage }) {

    const { t } = useTranslation();
    const { currentPage: vendorCurrentPage } = useVendorUIStore();
    const { user } = useAuthStore(); // add this import if not present
    const vendorId = user?._id || user?.id;

    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const bellRef = useRef(null);

    const { data, isLoading, refetch } = useGetNotification({ pageNum: page });
    const { mutate: markAll } = useMarkAllReadNotification();
    const { mutate: markOne } = useMarkSingleReadNotification();

    const notifications = data?.data || [];
    const unreadCount = data?.unreadCount || 0;
    const totalPages = data?.totalPages || 1;

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return t('vendorNotifications.justNow');
        if (mins < 60) return t('vendorNotifications.minsAgo', { count: mins });
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return t('vendorNotifications.hrsAgo', { count: hrs });
        const days = Math.floor(hrs / 24);
        return t('vendorNotifications.daysAgo', { count: days });
    };

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleMarkOne = (id, isRead, type) => {
        if (!isRead) markOne(id);

        const page = getRedirectPage(type);
        if (page) {
            setCurrentPage(page);
            setOpen(false);
        }
    };

    useEffect(() => {
        if (!vendorId) return;

        const socket = io(import.meta.env.VITE_SOCKET_URL);

        socket.emit("join_notifications", { role: "vendor", id: vendorId });

        socket.on("new_notification", () => {
            refetch();
        });

        return () => socket.disconnect();
    }, [vendorId]);

    const handleMarkAll = () => {
        if (unreadCount === 0) return;
        markAll();
    };

    return (
        <div className='relative' ref={bellRef}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen((prev) => !prev)}
                className='p-2.5 rounded-xl text-slate-500 hover:bg-pink-50 dark:hover:bg-slate-800 transition-all relative'
            >
                {unreadCount > 0
                    ? <BellRing className='w-5 h-5 text-pink-500' />
                    : <Bell className='w-5 h-5' />
                }
                {unreadCount > 0 && (
                    <span className='absolute top-1.5 right-1.5 min-w-4 h-4 bg-pink-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center'>
                        <span className='text-[9px] font-bold text-white leading-none px-0.5'>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="fixed left-3 right-3 top-16 z-50 max-h-[calc(100vh-5rem)] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/50 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-80">

                    {/* Header */}
                    <div className="border-b border-slate-100 px-3 py-3 dark:border-slate-700 sm:px-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                    <h3 className="wrap-break-words text-sm font-bold leading-tight text-slate-800 dark:text-white">
                                        {t('vendorNotifications.title')}
                                    </h3>

                                    {unreadCount > 0 && (
                                        <span className="shrink-0 rounded-full bg-pink-50 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-pink-500 dark:bg-pink-500/10">
                                            {t('vendorNotifications.newBadge', { count: unreadCount })}
                                        </span>
                                    )}
                                </div>

                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAll}
                                        className="mt-2 flex max-w-full items-center gap-1 rounded-lg py-1 pr-2 text-left text-[11px] font-medium leading-tight text-slate-400 transition-colors hover:text-pink-500"
                                    >
                                        <CheckCheck className="h-3.5 w-3.5 shrink-0" />
                                        <span className="wrap-break-words">
                                            {t('vendorNotifications.markAllRead')}
                                        </span>
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={() => setOpen(false)}
                                className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-[60vh] overflow-y-auto sm:max-h-90">
                        {isLoading && (
                            <div className='flex flex-col gap-2 p-4'>
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className='flex gap-3 animate-pulse'>
                                        <div className='w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 shrink-0' />
                                        <div className='flex-1 space-y-1.5'>
                                            <div className='h-3 bg-slate-100 dark:bg-slate-700 rounded-full w-3/4' />
                                            <div className='h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full w-full' />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isLoading && notifications.length === 0 && (
                            <div className='flex flex-col items-center justify-center py-10 gap-2'>
                                <Bell className='w-8 h-8 text-slate-200 dark:text-slate-600' />
                                <p className='text-xs text-slate-400'>
                                    {t('vendorNotifications.empty')}
                                </p>
                            </div>
                        )}

                        {!isLoading && notifications.map((n) => {
                            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.NEW_ORDER;
                            const Icon = config.icon;
                            return (
                                <div
                                    key={n._id}
                                    onClick={() => handleMarkOne(n._id, n.isRead, n.type)}
                                    className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-700/50 last:border-0
                                        ${!n.isRead
                                            ? 'bg-pink-50/50 dark:bg-pink-500/5 hover:bg-pink-50 dark:hover:bg-pink-500/10'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                        }`}
                                >
                                    {/* Icon */}
                                    <div className={`w-8 h-8 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                                        <Icon className={`w-4 h-4 ${config.color}`} />
                                    </div>

                                    {/* Content */}
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-start justify-between gap-1'>
                                            <p className={`wrap-break-words text-xs font-semibold leading-tight
                                                ${!n.isRead ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                                {n.title}
                                            </p>
                                            {!n.isRead && (
                                                <span className='w-1.5 h-1.5 bg-pink-500 rounded-full shrink-0 mt-1' />
                                            )}
                                        </div>
                                        <p className="mt-0.5 line-clamp-3 wrap-break-words text-[11px] leading-relaxed text-slate-400 sm:line-clamp-2">
                                            {n.message}
                                        </p>
                                        <p className='text-[10px] text-slate-300 dark:text-slate-500 mt-1'>
                                            {timeAgo(n.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className='flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-700'>
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className='text-[11px] font-medium text-slate-400 hover:text-pink-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                            >
                                {t('vendorNotifications.prev')}
                            </button>
                            <span className='text-[11px] text-slate-400'>
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className='text-[11px] font-medium text-slate-400 hover:text-pink-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                            >
                                {t('vendorNotifications.next')}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBellIcon;