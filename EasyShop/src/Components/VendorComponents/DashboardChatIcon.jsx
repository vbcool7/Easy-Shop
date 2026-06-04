
import React from 'react';
import { HiOutlineChatAlt2 } from "react-icons/hi";
import useAuthStore from '../../store/useAuthStore';
import { useVendorUnreadCount } from '../../hook/useChat';
import { useTranslation } from 'react-i18next';

function DashboardChatIcon({ setCurrentPage }) {

    const { t } = useTranslation();
    const { user } = useAuthStore();
    const vendorId = user?._id || user?.id;
    const { data: unreadCount } = useVendorUnreadCount(vendorId);

    return (
        <div>
            <button
                onClick={() => setCurrentPage("Messages")}
                className="fixed bottom-8 right-8 w-14 h-14 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-2xl shadow-pink-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-50 group">

                {/* Notification Badge (Optional) */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-6 w-6">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-6 w-6 bg-pink-600 text-[11px] border-2 border-white items-center justify-center font-bold">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    </span>
                )}

                <HiOutlineChatAlt2 size={28} />

                {/* Tooltip on Hover */}
                <span className="absolute right-16 bg-slate-800 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {t('dashboardChatIcon.tooltipText')}
                </span>
            </button>
        </div>
    )
}

export default DashboardChatIcon;