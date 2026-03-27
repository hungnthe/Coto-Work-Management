import { UserRole } from './common.types';

// Request DTOs
export interface AdminCreateUserDto {
  username: string;
  password: string;
  fullName: string;
  email: string;
  unitId: string;
  role: UserRole;
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface AdminUpdateUserDto {
  fullName?: string;
  email?: string;
  unitId?: string;
  role?: UserRole;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface RoleChangeDto {
  role: UserRole;
}

export interface BulkUserOperationDto {
  operation: 'activate' | 'deactivate' | 'delete' | 'changeRole';
  userIds: string[];
  role?: UserRole;
}

// Response DTOs
export interface UsernameAvailabilityDto {
  available: boolean;
  username: string;
}

export interface EmailAvailabilityDto {
  available: boolean;
  email: string;
}

export interface GeneratedPasswordDto {
  password: string;
}

export interface UserPermissionsDto {
  userId: string;
  permissions: string[];
}

export interface UserStatsDto {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Record<string, number>;
  usersByUnit: Record<string, number>;
}

export interface BulkOperationResultDto {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors?: string[];
}

export interface ResetPasswordResponseDto {
  newPassword: string;
  userId: string;
}
