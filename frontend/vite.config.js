import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],

    define: {
        // Fix "global is not defined" cho các thư viện CommonJS
        global: 'globalThis',
    },

    server: {
        port: 5173,
        proxy: {
            // User-service (auth, users, units...) → port 8083
            '/api/auth':  { target: 'http://localhost:8083', changeOrigin: true },
            '/api/admin': { target: 'http://localhost:8083', changeOrigin: true },
            '/api/units': { target: 'http://localhost:8083', changeOrigin: true },

            // Task-service (tasks, notifications) → port 8084
            '/api/tasks':         { target: 'http://localhost:8084', changeOrigin: true },
            '/api/notifications': { target: 'http://localhost:8084', changeOrigin: true },

            // WebSocket task-service
            '/ws': {
                target: 'http://localhost:8084',
                changeOrigin: true,
                ws: true,
            },
        },
    },
});