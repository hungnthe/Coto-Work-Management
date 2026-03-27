// src/hooks/useNotifications.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';
import SockJS from 'sockjs-client';

const TASK_BASE = import.meta.env.VITE_TASK_API_BASE_URL || 'http://localhost:80/api';
const SOCKJS_URL = TASK_BASE.replace('/api', '/ws');

export function useNotifications() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount,   setUnreadCount]   = useState(0);
    const [totalPages,    setTotalPages]    = useState(0);
    const [currentPage,   setCurrentPage]  = useState(0);
    const [loading,       setLoading]      = useState(false);
    const [wsConnected,   setWsConnected]  = useState(false);
    const [latestNotification, setLatestNotification] = useState(null)

    const stompRef = useRef(null);

    // ── Fetch ────────────────────────────────────────────────
    const fetchNotifications = useCallback(async (page = 0) => {
        setLoading(true);
        try {
            const data = await notificationService.getMyNotifications(page, 20);
            setNotifications(prev =>
                page === 0
                    ? (data.notifications ?? [])
                    : [...prev, ...(data.notifications ?? [])]
            );
            setUnreadCount(data.totalUnread ?? 0);
            setTotalPages(data.totalPages   ?? 0);
            setCurrentPage(page);
        } catch (e) {
            console.error('[Notif] fetch error:', e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMore = useCallback(() => {
        if (currentPage + 1 < totalPages) fetchNotifications(currentPage + 1);
    }, [currentPage, totalPages, fetchNotifications]);

    const markAsRead = useCallback(async (id) => {
        try {
            const data = await notificationService.markAsRead(id);
            if (data.success) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, isRead: true } : n)
                );
                setUnreadCount(data.unreadCount ?? 0);
            }
        } catch (e) {
            console.error('[Notif] markAsRead error:', e.message);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (e) {
            console.error('[Notif] markAllAsRead error:', e.message);
        }
    }, []);

    // ── Fetch: CHỈ khi auth xong và đã login ────────────────
    useEffect(() => {
        if (authLoading || !isAuthenticated) return;
        fetchNotifications(0);
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, [authLoading, isAuthenticated, fetchNotifications]);

    // ── WebSocket: CHỈ khi auth xong và đã login ────────────
    useEffect(() => {
        if (authLoading || !isAuthenticated) return;

        const token = localStorage.getItem('accessToken');
        if (!token) return;
        if (stompRef.current?.active) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(SOCKJS_URL),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            onConnect: () => {
                setWsConnected(true);
                client.subscribe('/user/queue/notifications', (msg) => {
                    const payload = JSON.parse(msg.body);


                    setNotifications(prev => [{ ...payload, isRead: false }, ...prev]);
                    setUnreadCount(payload.unreadCount ?? 0);
                    setLatestNotification({ ...payload, _ts: Date.now() });

                    triggerPush(payload);
                });
            },
            onDisconnect: () => setWsConnected(false),
            onStompError: (f) => console.error('[WS]', f.headers['message']),
        });

        client.activate();
        stompRef.current = client;
        return () => { client.deactivate(); stompRef.current = null; };
    }, [authLoading, isAuthenticated]);

    function triggerPush(payload) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const n = new Notification(payload.title, {
                body: payload.message || payload.taskTitle || '',
                icon: '/favicon.ico',
                tag: `notif-${payload.id}`,
            });
            n.onclick = () => {
                window.focus();
                if (payload.taskId) window.location.href = `/tasks?taskId=${payload.taskId}`;
                n.close();
            };
            setTimeout(() => n.close(), 5000);
        }
    }

    return {
        notifications, unreadCount, loading, wsConnected,
        hasMore: currentPage + 1 < totalPages,
        latestNotification,
        fetchNotifications, loadMore, markAsRead, markAllAsRead,
    };
}