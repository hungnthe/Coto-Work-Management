import { UserRole, Permission } from './common.types';

/**
 * Account Self-Service DTOs
 * For /api/account endpoints
 */

// Account Settings
export interface AccountSettingsDto {
  [key: string]: any;
}

// User Permissions Response
export interface UserPermissionsDto {
  userId: number;
  username: string;
  role: UserRole;
  permissions: Permission[];
}

// Activity Log Entry
export interface ActivityLogDto {
  id: number;
  userId: number;
  action: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}

// Session Info
export interface SessionDto {
  id: string;
  userId: number;
  deviceInfo?: string;
  ipAddress?: string;
  loginTime: string;
  lastActivity: string;
  isActive: boolean;
}

// Account Deactivation Request
export interface DeactivateAccountDto {
  reason?: string;
}

// Account Deletion Request
export interface DeleteAccountRequestDto {
  reason?: string;
}

// Account Deletion Request Response
export interface DeleteAccountRequestResponseDto {
  requestId: string;
  status: string;
  message: string;
}

// Password Change Response
export interface PasswordChangeResponseDto {
  message: string;
}
