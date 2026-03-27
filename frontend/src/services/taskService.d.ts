// src/services/taskService.d.ts

export interface AssignTaskPayload {
    title: string;
    description?: string;
    startDate?: string;         // YYYY-MM-DD
    dueDate?: string;           // YYYY-MM-DD
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status?: string;
    category?: string;
    assigneeIds?: number[];
    assigneeNames?: string[];
    unitId?: number;
    unitName?: string;
    unitMemberIds?: number[];   // để gửi notification
    // Notification
    sendNotification?: boolean;
    notificationMessage?: string;
}

export interface AssignTaskResult {
    createdCount: number;
    notificationSent: number;
    tasks: any[];
    message: string;
}

declare const taskService: {
    // Calendar
    getMyCalendar:   (start: string, end: string) => Promise<any[]>;
    getAllCalendar:   (start: string, end: string) => Promise<any[]>;
    getUnitCalendar: (unitId: number, start: string, end: string) => Promise<any[]>;
    // CRUD
    createTask:      (data: any) => Promise<any>;
    getTaskById:     (id: number) => Promise<any>;
    updateTask:      (id: number, data: any) => Promise<any>;
    moveTask:        (id: number, data: any) => Promise<any>;
    toggleComplete:  (id: number) => Promise<any>;
    deleteTask:      (id: number) => Promise<void>;
    getOverdueTasks: () => Promise<any[]>;
    // Assign
    assignTask:      (data: AssignTaskPayload) => Promise<AssignTaskResult>;
    // Stats
    getTaskStats:    (from?: string, to?: string) => Promise<{
        period: { from: string; to: string };
        total: number;
        completed: number;
        inProgress: number;
        todo: number;
        review: number;
        cancelled: number;
        overdue: number;
        completionRate: number;
        byPriority: { URGENT: number; HIGH: number; MEDIUM: number; LOW: number };
    }>;
};

export default taskService;