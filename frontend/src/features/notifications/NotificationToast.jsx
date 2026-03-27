import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BellAlertIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const TYPE_META = {
    TASK_ASSIGNED: { icon: '📋', color: '#6366f1', bg: '#eef2ff' },
    TASK_UPDATED:  { icon: '✏️',  color: '#8b5cf6', bg: '#f5f3ff' },
    TASK_DUE_SOON: { icon: '⏰',  color: '#f59e0b', bg: '#fffbeb' },
    TASK_OVERDUE:  { icon: '🚨',  color: '#ef4444', bg: '#fef2f2' },
    GENERAL:       { icon: '📢',  color: '#64748b', bg: '#f8fafc' },
};

// ── Single Toast ──────────────────────────────────────────────
const Toast = ({ toast, onDismiss }) => {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const timerRef = useRef(null);

    const meta = TYPE_META[toast.type] || TYPE_META.GENERAL;

    // Slide in
    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    // Auto dismiss after 5s
    useEffect(() => {
        timerRef.current = setTimeout(() => dismiss(), 5000);
        return () => clearTimeout(timerRef.current);
    }, []);

    const dismiss = useCallback(() => {
        setLeaving(true);
        setTimeout(() => onDismiss(toast.id), 350);
    }, [toast.id, onDismiss]);

    const handleClick = () => {
        dismiss();
        if (toast.taskId) navigate(`/tasks?taskId=${toast.taskId}`);
    };

    return (
        <div
            onClick={handleClick}
            style={{
                transform: visible && !leaving ? 'translateX(0)' : 'translateX(120%)',
                opacity: leaving ? 0 : 1,
                transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
                cursor: 'pointer',
                background: 'white',
                borderRadius: 14,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                border: `1px solid ${meta.color}22`,
                overflow: 'hidden',
                marginBottom: 10,
                maxWidth: 340,
                minWidth: 300,
                position: 'relative',
            }}
        >
            {/* Progress bar */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: `${meta.color}33`,
            }}>
                <div style={{
                    height: '100%',
                    background: meta.color,
                    animation: 'shrink 5s linear forwards',
                }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 14px 12px' }}>
                {/* Icon */}
                <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: meta.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0,
                }}>
                    {meta.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: 13, fontWeight: 700, color: '#0f172a',
                        marginBottom: 2, lineHeight: 1.3,
                    }}>
                        {toast.title}
                    </div>
                    {toast.message && (
                        <div style={{
                            fontSize: 12, color: '#64748b', lineHeight: 1.4,
                            overflow: 'hidden', display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        }}>
                            {toast.message}
                        </div>
                    )}
                    {toast.taskTitle && (
                        <div style={{
                            fontSize: 11.5, color: meta.color, fontWeight: 600,
                            marginTop: 4, display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                            📋 {toast.taskTitle}
                        </div>
                    )}
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                        {toast.senderName} · Vừa xong
                    </div>
                </div>

                {/* Close */}
                <button
                    onClick={e => { e.stopPropagation(); dismiss(); }}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#94a3b8', padding: 2, borderRadius: 4,
                        display: 'flex', alignItems: 'center', flexShrink: 0,
                    }}
                >
                    <XMarkIcon style={{ width: 16, height: 16 }} />
                </button>
            </div>
        </div>
    );
};

// ── Toast Container ───────────────────────────────────────────
const NotificationToast = ({ newNotification }) => {
    const [toasts, setToasts] = useState([]);
    const prevRef = useRef(null);

    // Nhận notification mới từ WebSocket
    useEffect(() => {
        if (!newNotification) return;
        if (prevRef.current?.id === newNotification.id) return;
        prevRef.current = newNotification;

        setToasts(prev => [
            { ...newNotification, _toastId: Date.now() },
            ...prev.slice(0, 2), // Tối đa 3 toast cùng lúc
        ]);
    }, [newNotification]);

    const dismiss = useCallback((toastId) => {
        setToasts(prev => prev.filter(t => t._toastId !== toastId));
    }, []);

    if (toasts.length === 0) return null;

    return (
        <>
            <style>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to   { width: 0%; }
                }
            `}</style>
            <div style={{
                position: 'fixed',
                bottom: 24, right: 24,
                zIndex: 9999,
                display: 'flex', flexDirection: 'column-reverse',
                alignItems: 'flex-end',
                pointerEvents: 'none',
            }}>
                {toasts.map(t => (
                    <div key={t._toastId} style={{ pointerEvents: 'auto' }}>
                        <Toast
                            toast={{ ...t, id: t._toastId }}
                            onDismiss={() => dismiss(t._toastId)}
                        />
                    </div>
                ))}
            </div>
        </>
    );
};

export default NotificationToast;