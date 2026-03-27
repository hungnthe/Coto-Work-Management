// Enums for fixed value sets
export enum UserRole {
  ADMIN = 'ADMIN',
  UNIT_MANAGER = 'UNIT_MANAGER',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER'
}

export enum Permission {
  // User Management Permissions
  USER_READ = 'user:read',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE_ALL = 'user:manage_all',
  
  // Unit Management Permissions
  UNIT_READ = 'unit:read',
  UNIT_CREATE = 'unit:create',
  UNIT_UPDATE = 'unit:update',
  UNIT_DELETE = 'unit:delete',
  UNIT_MANAGE_ALL = 'unit:manage_all',
  
  // Task Management Permissions
  TASK_READ = 'task:read',
  TASK_CREATE = 'task:create',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',
  TASK_ASSIGN = 'task:assign',
  TASK_MANAGE_ALL = 'task:manage_all',
  
  // News Management Permissions
  NEWS_READ = 'news:read',
  NEWS_CREATE = 'news:create',
  NEWS_UPDATE = 'news:update',
  NEWS_DELETE = 'news:delete',
  NEWS_PUBLISH = 'news:publish',
  NEWS_MANAGE_ALL = 'news:manage_all',
  
  // File Management Permissions
  FILE_READ = 'file:read',
  FILE_UPLOAD = 'file:upload',
  FILE_DELETE = 'file:delete',
  FILE_MANAGE_ALL = 'file:manage_all',
  
  // Project Management Permissions
  PROJECT_READ = 'project:read',
  PROJECT_CREATE = 'project:create',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  PROJECT_MANAGE_ALL = 'project:manage_all',
  
  // Analytics Permissions
  ANALYTICS_READ = 'analytics:read',
  ANALYTICS_MANAGE = 'analytics:manage',
  
  // System Administration Permissions
  SYSTEM_ADMIN = 'system:admin',
  SYSTEM_MONITOR = 'system:monitor'
}

// API Error structure
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

// Generic API response wrapper (if backend uses one)
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
