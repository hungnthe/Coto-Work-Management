import axios from 'axios';

const TASK_BASE = import.meta.env.VITE_TASK_API_BASE_URL || 'http://localhost:8084/api';

const taskApi = axios.create({
    baseURL: TASK_BASE,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
});

taskApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

taskApi.interceptors.response.use(
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
                    return taskApi(original);
                }
            } catch {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject({
            message: error.response?.data?.error_message || error.response?.data?.message || 'Lỗi kết nối task-service',
            statusCode: error.response?.status || 0,
        });
    }
);

const client = {
    get:    (url, cfg)       => taskApi.get(url, cfg).then(r => r.data),
    post:   (url, data, cfg) => taskApi.post(url, data, cfg).then(r => r.data),
    put:    (url, data, cfg) => taskApi.put(url, data, cfg).then(r => r.data),
    patch:  (url, data, cfg) => taskApi.patch(url, data, cfg).then(r => r.data),
    delete: (url, cfg)       => taskApi.delete(url, cfg).then(r => r.data),
};

const taskService = {
    // ── Calendar ──────────────────────────────────────────────────
    getMyCalendar:   (start, end) => client.get(`/tasks/calendar?start=${start}&end=${end}`),
    getAllCalendar:   (start, end) => client.get(`/tasks/calendar/all?start=${start}&end=${end}`),
    getUnitCalendar: (unitId, start, end) => client.get(`/tasks/calendar/unit/${unitId}?start=${start}&end=${end}`),

    // ── CRUD ──────────────────────────────────────────────────────
    createTask:     (data)       => client.post('/tasks', data),
    getTaskById:    (id)         => client.get(`/tasks/${id}`),
    updateTask:     (id, data)   => client.put(`/tasks/${id}`, data),
    moveTask:       (id, data)   => client.patch(`/tasks/${id}/move`, data),
    toggleComplete: (id)         => client.patch(`/tasks/${id}/toggle-complete`),
    deleteTask:     (id)         => client.delete(`/tasks/${id}`),
    getOverdueTasks:()           => client.get('/tasks/overdue'),

    // ── Assign ────────────────────────────────────────────────────
    /**
     * Giao việc cho nhiều người hoặc cả phòng ban.
     *
     * @param {Object} data
     * @param {string}   data.title
     * @param {string}   [data.description]
     * @param {string}   [data.startDate]        YYYY-MM-DD
     * @param {string}   [data.dueDate]          YYYY-MM-DD
     * @param {string}   [data.priority]         LOW|MEDIUM|HIGH|URGENT
     * @param {number[]} [data.assigneeIds]      giao cho người cụ thể
     * @param {string[]} [data.assigneeNames]    tên cache (cùng index)
     * @param {number}   [data.unitId]           giao cho phòng ban
     * @param {string}   [data.unitName]
     * @param {number[]} [data.unitMemberIds]    để gửi notification
     * @param {boolean}  [data.sendNotification] default true
     * @param {string}   [data.notificationMessage]
     *
     * @returns {Promise<{createdCount, notificationSent, tasks, message}>}
     */
    assignTask: (data) => client.post('/tasks/assign', data),

    // ── Stats ─────────────────────────────────────────────────────
    // GET /api/tasks/stats?from=YYYY-MM-DD&to=YYYY-MM-DD
    getTaskStats: (from, to) => {
        const params = new URLSearchParams();
        if (from) params.append('from', from);
        if (to)   params.append('to', to);
        return client.get(`/tasks/stats?${params.toString()}`);
    },
};

export default taskService;