// Type declaration cho notificationService.js
// Đặt cùng thư mục: src/services/notificationService.d.ts

declare const notificationService: {
    getMyNotifications: (page?: number, size?: number) => Promise<{
        notifications: any[];
        totalUnread: number;
        totalElements: number;
        totalPages: number;
        currentPage: number;
    }>;
    getUnreadCount:    () => Promise<{ unreadCount: number }>;
    markAsRead:        (id: number) => Promise<{ success: boolean; unreadCount: number }>;
    markAllAsRead:     () => Promise<{ success: boolean; markedCount: number; unreadCount: number }>;
    sendNotification:  (payload: any) => Promise<{ success: boolean; sentCount: number }>;
};

export default notificationService;