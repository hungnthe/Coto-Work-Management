// src/pages/NotificationPage.jsx
// Route: /notifications
// Thêm vào App.jsx: <Route path="/notifications" element={<NotificationPage />} />

import React, { useState } from 'react';
import {
    BellIcon,
    CheckCircleIcon,
    FunnelIcon,
    ArrowPathIcon,
    InboxIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { useNotifications } from '../hooks/useNotifications.js';
import { useNavigate } from 'react-router-dom';

// ── Config ────────────────────────────────────────────────────
// Màu đồng bộ với PRIORITY/CATEGORY trong TaskManagementPage
const FILTERS = [
    { key: 'ALL',           icon: '🔔', label: 'Tất cả'    },
    { key: 'TASK_ASSIGNED', icon: '📋', label: 'Giao việc', color: 'indigo' },
    { key: 'TASK_UPDATED',  icon: '✏️',  label: 'Cập nhật', color: 'violet' },
    { key: 'TASK_DUE_SOON', icon: '⏰',  label: 'Sắp hạn',  color: 'amber'  },
    { key: 'TASK_OVERDUE',  icon: '🚨',  label: 'Quá hạn',  color: 'red'    },
    { key: 'GENERAL',       icon: '📢',  label: 'Chung',    color: 'gray'   },
];

const COLOR = {
    indigo: { badge: 'bg-indigo-100 text-indigo-700', icon: 'bg-indigo-50',  dot: 'bg-indigo-500', activeBg: 'bg-indigo-600' },
    violet: { badge: 'bg-violet-100 text-violet-700', icon: 'bg-violet-50',  dot: 'bg-violet-500', activeBg: 'bg-violet-600' },
    amber:  { badge: 'bg-amber-100  text-amber-700',  icon: 'bg-amber-50',   dot: 'bg-amber-500',  activeBg: 'bg-amber-500'  },
    red:    { badge: 'bg-red-100    text-red-700',    icon: 'bg-red-50',     dot: 'bg-red-500',    activeBg: 'bg-red-600'    },
    gray:   { badge: 'bg-gray-100   text-gray-700',   icon: 'bg-gray-100',   dot: 'bg-gray-400',   activeBg: 'bg-gray-600'   },
};

function getMeta(type) {
    return FILTERS.find(f => f.key === type) || FILTERS[FILTERS.length - 1];
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Vừa xong';
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    const d = Math.floor(h / 24);
    if (d < 7)  return `${d} ngày trước`;
    return new Date(dateStr).toLocaleDateString('vi-VN');
}

// ── NotificationCard ──────────────────────────────────────────
const NotificationCard = ({ n, onRead }) => {
    const navigate = useNavigate();
    const typeMeta = getMeta(n.type);
    const colors   = COLOR[typeMeta.color] || COLOR.gray;

    const handleClick = () => {
        if (!n.isRead) onRead(n.id);
        if (n.taskId)  navigate(`/tasks?taskId=${n.taskId}`);
    };

    return (
        <div
            onClick={handleClick}
            className={`relative flex gap-4 p-4 rounded-xl border cursor-pointer
                transition-all duration-150 hover:shadow-md hover:-translate-y-px
                ${n.isRead
                ? 'bg-white border-gray-100'
                : 'bg-indigo-50/40 border-indigo-100'
            }`}
        >
            {/* Unread bar */}
            {!n.isRead && (
                <div className="absolute left-0 top-3 bottom-3 w-0.5
                    bg-indigo-500 rounded-full" />
            )}

            {/* Icon */}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center
                flex-shrink-0 text-xl ${colors.icon}`}>
                {typeMeta.icon}
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className={`text-sm leading-snug
                        ${!n.isRead
                        ? 'font-semibold text-gray-900'
                        : 'font-medium text-gray-700'
                    }`}>
                        {n.title}
                    </p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5
                        rounded flex-shrink-0 ${colors.badge}`}>
                        {typeMeta.label}
                    </span>
                </div>

                {n.message && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {n.message}
                    </p>
                )}

                {n.taskTitle && (
                    <p className={`text-xs mt-1.5 font-medium truncate
                        ${colors.badge.split(' ')[1]}`}>
                        📋 {n.taskTitle}
                    </p>
                )}

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                        {/* Avatar chữ cái - giống pattern trong TaskManagementPage */}
                        <div className="w-4 h-4 rounded-full bg-indigo-100
                            flex items-center justify-center">
                            <span className="text-[8px] font-bold text-indigo-600">
                                {(n.senderName || '?').charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <span className="text-xs text-gray-400">
                            {n.senderName} · {timeAgo(n.createdAt)}
                        </span>
                    </div>

                    {n.isRead
                        ? <CheckCircleSolid className="h-4 w-4 text-gray-200" />
                        : <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    }
                </div>
            </div>
        </div>
    );
};

// ── Skeleton ──────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-white animate-pulse">
        <div className="w-11 h-11 bg-gray-100 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="flex justify-between gap-4">
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-14" />
            </div>
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
    </div>
);

// ── NotificationPage ──────────────────────────────────────────
const NotificationPage = () => {
    const [activeFilter,   setActiveFilter]   = useState('ALL');
    const [unreadOnly,     setUnreadOnly]      = useState(false);

    const {
        notifications, unreadCount, loading,
        wsConnected, hasMore,
        fetchNotifications, loadMore,
        markAsRead, markAllAsRead,
    } = useNotifications();

    // Filter client-side (tương tự filter trong TaskManagementPage)
    const filtered = notifications.filter(n => {
        if (unreadOnly && n.isRead) return false;
        if (activeFilter !== 'ALL' && n.type !== activeFilter) return false;
        return true;
    });

    // Count theo type để hiện badge trên tab
    const countOf = (key) => key === 'ALL'
        ? notifications.length
        : notifications.filter(n => n.type === key).length;

    return (
        <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">

            {/* ── Page header ─────────────────────────────── */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <BellIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Thông báo</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full
                                ${wsConnected ? 'bg-green-400' : 'bg-gray-300'}`} />
                            <span className="text-xs text-gray-400">
                                {wsConnected ? 'Đang kết nối real-time' : 'Không có kết nối'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchNotifications(0)}
                        disabled={loading}
                        title="Làm mới"
                        className="p-2 text-gray-500 hover:text-gray-700
                            hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium
                                text-indigo-600 bg-indigo-50 hover:bg-indigo-100
                                rounded-lg transition-colors"
                        >
                            <CheckCircleIcon className="h-4 w-4" />
                            Đọc tất cả ({unreadCount})
                        </button>
                    )}
                </div>
            </div>

            {/* ── Filter tabs ──────────────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-xl p-1.5
                flex gap-1 overflow-x-auto mb-4">
                {FILTERS.map(f => {
                    const cnt = countOf(f.key);
                    const active = activeFilter === f.key;
                    return (
                        <button
                            key={f.key}
                            onClick={() => setActiveFilter(f.key)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg
                                text-xs font-medium whitespace-nowrap flex-shrink-0
                                transition-all duration-150
                                ${active
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                            }`}
                        >
                            <span>{f.icon}</span>
                            <span>{f.label}</span>
                            {cnt > 0 && (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold
                                    ${active
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {cnt}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Toolbar ──────────────────────────────────── */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                    {filtered.length} thông báo
                    {unreadOnly && <span className="ml-1 text-indigo-500">(chưa đọc)</span>}
                </p>

                {/* Toggle chưa đọc */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <button
                        onClick={() => setUnreadOnly(v => !v)}
                        className={`relative w-9 h-5 rounded-full transition-colors duration-200
                            ${unreadOnly ? 'bg-indigo-600' : 'bg-gray-200'}`}
                    >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full
                            shadow-sm transition-transform duration-200
                            ${unreadOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                    <span className="flex items-center gap-1 text-sm text-gray-600 font-medium">
                        <FunnelIcon className="h-3.5 w-3.5" />
                        Chưa đọc
                    </span>
                </label>
            </div>

            {/* ── List ─────────────────────────────────────── */}
            {loading && filtered.length === 0 ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-xl py-16 text-center">
                    <InboxIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                        {unreadOnly ? 'Bạn đã đọc hết thông báo!' : 'Chưa có thông báo nào'}
                    </p>
                    {unreadOnly && (
                        <button
                            onClick={() => setUnreadOnly(false)}
                            className="mt-2 text-sm text-indigo-500 hover:underline"
                        >
                            Xem tất cả
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(n => (
                        <NotificationCard key={n.id} n={n} onRead={markAsRead} />
                    ))}
                </div>
            )}

            {/* ── Load more ────────────────────────────────── */}
            {hasMore && !loading && (
                <button
                    onClick={loadMore}
                    className="w-full mt-4 py-3 text-sm font-medium text-gray-500
                        bg-white border border-gray-200 rounded-xl
                        hover:bg-gray-50 transition-colors"
                >
                    Xem thêm
                </button>
            )}
            {loading && filtered.length > 0 && (
                <div className="mt-4 text-center">
                    <div className="animate-spin rounded-full h-5 w-5
                        border-b-2 border-indigo-600 mx-auto" />
                </div>
            )}
        </div>
    );
};

export default NotificationPage;