// src/services/notificationService.js
// ★ Dùng cùng pattern với taskService.js (axios + port 8084)
// KHÔNG dùng fetch/proxy nữa - tránh CORS và port sai

import axios from 'axios';

// ★ Cùng base URL với taskService.js
const TASK_BASE = import.meta.env.VITE_TASK_API_BASE_URL || 'https://hedgiest-kasandra-semianatomic.ngrok-free.dev/api';

const notifApi = axios.create({
    baseURL: TASK_BASE,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// Request: gắn Bearer token - giống taskService.js
notifApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response: xử lý lỗi - giống taskService.js
notifApi.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const userBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api';
                    const res = await axios.post(`${userBase}/auth/refresh`, { refreshToken });
                    localStorage.setItem('accessToken', res.data.accessToken);
                    localStorage.setItem('refreshToken', res.data.refreshToken);
                    original.headers.Authorization = `Bearer ${res.data.accessToken}`;
                    return notifApi(original);
                }
            } catch {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject({
            message: error.response?.data?.message || 'Lỗi kết nối notification service',
            statusCode: error.response?.status || 0,
        });
    }
);

const client = {
    get:   (url, cfg)       => notifApi.get(url, cfg).then(r => r.data),
    post:  (url, data, cfg) => notifApi.post(url, data, cfg).then(r => r.data),
    patch: (url, data, cfg) => notifApi.patch(url, data, cfg).then(r => r.data),
};

const notificationService = {
    // GET /notifications?page=0&size=20
    getMyNotifications: (page = 0, size = 20) =>
        client.get(`/notifications?page=${page}&size=${size}`),

    // GET /notifications/unread-count
    getUnreadCount: () =>
        client.get('/notifications/unread-count'),

    // PATCH /notifications/{id}/read
    markAsRead: (id) =>
        client.patch(`/notifications/${id}/read`),

    // PATCH /notifications/read-all
    markAllAsRead: () =>
        client.patch('/notifications/read-all'),

    // POST /notifications/send  (Admin only)
    sendNotification: (payload) =>
        client.post('/notifications/send', payload),
};

export default notificationService;