// Enums
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED'
}

// Response DTOs
export interface TaskDto {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: string;
  assigneeName?: string;
  creatorId: string;
  creatorName?: string;
  dueDate: string; // ISO 8601 format
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

// Request DTOs
export interface CreateTaskDto {
  title: string;
  description: string;
  priority: TaskPriority;
  status?: TaskStatus;
  assigneeId: string;
  dueDate: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assigneeId?: string;
  dueDate?: string;
}
