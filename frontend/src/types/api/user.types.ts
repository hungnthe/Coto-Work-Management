import { UserRole } from './common.types';
import { UnitSummaryDto } from './unit.types';

// Response DTOs
export interface UserResponseDto {
  id: number;
  username: string;
  fullName: string;
  email: string;
  unit: UnitSummaryDto;
  role: UserRole;
  isActive: boolean;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
  phoneNumber: string | null;
  avatarUrl: string | null;
}

// Request DTOs
export interface CreateUserDto {
  username: string;
  password: string;
  fullName: string;
  email: string;
  unitId: number;
  role: UserRole;
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  unitId?: number;
  role?: UserRole;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}
