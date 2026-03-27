// src/services/fileService.js
// Upload file lên task-service /api/files/upload

import axios from 'axios';

const TASK_BASE = import.meta.env.VITE_TASK_API_BASE_URL || 'http://localhost:8084/api';

const fileApi = axios.create({
    baseURL: TASK_BASE,
    timeout: 60000, // 60s cho upload file lớn
    headers: { 'ngrok-skip-browser-warning': 'true' },
});

fileApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

fileApi.interceptors.response.use(
    (res) => res,
    (error) => Promise.reject({
        message: error.response?.data?.message || 'Lỗi upload file',
        statusCode: error.response?.status || 0,
    })
);

const fileService = {
    /**
     * Upload nhiều file cùng lúc
     * @param {File[]} files
     * @param {Function} onProgress - callback(percent: number)
     * @returns {Promise<{ urls: string[], uploaded: Array, count: number }>}
     */
    uploadFiles: (files, onProgress) => {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));

        return fileApi.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => {
                if (onProgress && e.total) {
                    onProgress(Math.round((e.loaded * 100) / e.total));
                }
            },
        }).then(r => r.data);
    },

    /**
     * Lấy full URL để hiển thị/download
     * @param {string} path - path từ API (/api/files/...)
     */
    getFullUrl: (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return TASK_BASE.replace('/api', '') + path;
    },
};

export default fileService;