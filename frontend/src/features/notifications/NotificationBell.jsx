// src/features/notifications/NotificationBell.jsx
// ★ Tất cả hooks gọi TRƯỚC mọi return - tuân thủ Rules of Hooks

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { useNotifications } from '../../hooks/useNotifications.js';
import NotificationToast from './NotificationToast';


const TYPE_META = {
    TASK_ASSIGNED: { icon: '📋', bg: 'bg-indigo-50',  text: 'text-indigo-700',  label: 'Giao việc' },
    TASK_UPDATED:  { icon: '✏️',  bg: 'bg-violet-50',  text: 'text-violet-700',  label: 'Cập nhật'  },
    TASK_DUE_SOON: { icon: '⏰',  bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Sắp hạn'  },
    TASK_OVERDUE:  { icon: '🚨',  bg: 'bg-red-50',     text: 'text-red-700',     label: 'Quá hạn'   },
    GENERAL:       { icon: '📢',  bg: 'bg-gray-50',    text: 'text-gray-600',    label: 'Thông báo' },
};

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const utcStr = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
    const diff = Date.now() - new Date(utcStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Vừa xong';
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
}

const NotificationBell = () => {
    // ★ TẤT CẢ hooks phải ở đây, TRƯỚC mọi return/điều kiện
    const [open, setOpen] = useState(false);
    const dropdownRef    = useRef(null);
    const navigate       = useNavigate();


    const {
        notifications, unreadCount, loading,
        wsConnected, hasMore,
        latestNotification,
        markAsRead, markAllAsRead, loadMore,
    } = useNotifications();

    // Đóng dropdown khi click ngoài
    useEffect(() => {
        function handler(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Handlers ─────────────────────────────────────────────
    const handleItemClick = (n) => {
        if (!n.isRead) markAsRead(n.id);
        if (n.taskId)  navigate(`/tasks?taskId=${n.taskId}`);
        setOpen(false);
    };

    const meta = (type) => TYPE_META[type] || TYPE_META.GENERAL;

    // ── Render ───────────────────────────────────────────────
    return (
        <>
        <div className="relative" ref={dropdownRef}>
            {/* Bell button */}
            <button
                onClick={() => setOpen(prev => !prev)}
                className={`relative p-2 rounded-lg transition-colors duration-150
                    ${open
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="Thông báo"
            >
                {unreadCount > 0
                    ? <BellAlertIcon className="h-6 w-6" />
                    : <BellIcon      className="h-6 w-6" />
                }
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5
                        min-w-[18px] h-[18px] px-1
                        bg-red-500 text-white text-[10px] font-bold rounded-full
                        flex items-center justify-center border-2 border-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-96 z-50
                    bg-white rounded-xl shadow-lg border border-gray-200
                    animate-[dropIn_0.15s_ease-out]">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">Thông báo</span>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                                    {unreadCount} chưa đọc
                                </span>
                            )}
                            <span
                                title={wsConnected ? 'Real-time' : 'Mất kết nối'}
                                className={`w-1.5 h-1.5 rounded-full
                                    ${wsConnected ? 'bg-green-400' : 'bg-gray-300'}`}
                            />
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-indigo-600 font-medium
                                    hover:text-indigo-800 hover:bg-indigo-50
                                    px-2 py-1 rounded-md transition-colors"
                            >
                                Đọc tất cả
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
                        {loading && notifications.length === 0 ? (
                            <div className="py-10 text-center">
                                <div className="animate-spin rounded-full h-6 w-6
                                    border-b-2 border-indigo-600 mx-auto" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-12 text-center">
                                <BellIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">Chưa có thông báo</p>
                            </div>
                        ) : (
                            notifications.slice(0, 10).map(n => {
                                const m = meta(n.type);
                                return (
                                    <button
                                        key={n.id}
                                        onClick={() => handleItemClick(n)}
                                        className={`w-full text-left flex gap-3 px-4 py-3
                                            transition-colors hover:bg-gray-50
                                            ${!n.isRead ? 'bg-indigo-50/40' : ''}`}
                                    >
                                        <div className={`w-9 h-9 rounded-lg flex items-center
                                            justify-center flex-shrink-0 text-base ${m.bg}`}>
                                            {m.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm leading-snug truncate
                                                ${!n.isRead
                                                ? 'font-semibold text-gray-900'
                                                : 'font-normal text-gray-700'
                                            }`}>
                                                {n.title}
                                            </p>
                                            {n.message && (
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                    {n.message}
                                                </p>
                                            )}
                                            {n.taskTitle && (
                                                <p className={`text-xs mt-1 font-medium truncate ${m.text}`}>
                                                    📋 {n.taskTitle}
                                                </p>
                                            )}
                                            <p className="text-[11px] text-gray-400 mt-1">
                                                {n.senderName} · {timeAgo(n.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0 self-center">
                                            {!n.isRead
                                                ? <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                : <CheckCircleIcon className="h-4 w-4 text-gray-200" />
                                            }
                                        </div>
                                    </button>
                                );
                            })
                        )}

                        {hasMore && (
                            <div className="px-4 py-2">
                                <button
                                    onClick={loadMore}
                                    disabled={loading}
                                    className="w-full py-2 text-xs font-medium text-gray-500
                                        border border-gray-200 rounded-lg
                                        hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Đang tải...' : 'Tải thêm'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 rounded-b-xl">
                        <button
                            onClick={() => { navigate('/notifications'); setOpen(false); }}
                            className="block w-full text-center text-xs font-medium
                                text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                            Xem tất cả thông báo →
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes dropIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
        <NotificationToast newNotification={latestNotification} />
        </>
    );
};

export default NotificationBell;