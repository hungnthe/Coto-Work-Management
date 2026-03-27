// Response DTOs
export interface NotificationDto {
  id: string;
  userId: string;
  type: 'task' | 'meeting' | 'urgent' | 'info' | 'system';
  title: string;
  message: string;
  timestamp: string; // ISO 8601 format
  read: boolean;
  actionButton?: {
    text: string;
    action: string;
    data?: Record<string, any>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UnreadCountDto {
  count: number;
}

// Request DTOs
export interface CreateNotificationDto {
  userId: string;
  type: 'task' | 'meeting' | 'urgent' | 'info' | 'system';
  title: string;
  message: string;
  actionButton?: {
    text: string;
    action: string;
    data?: Record<string, any>;
  };
}

export interface BulkNotificationDto {
  userIds: string[];
  type: 'task' | 'meeting' | 'urgent' | 'info' | 'system';
  title: string;
  message: string;
  actionButton?: {
    text: string;
    action: string;
    data?: Record<string, any>;
  };
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: string;
}
