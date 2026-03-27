import { UserRole, Permission } from './common.types';

// Request DTOs
export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

// Response DTOs
export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  unitId: number;
  unitName: string;
  permissions: Permission[];
}

export interface TokenRefreshResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface ValidateTokenResponseDto {
  valid: boolean;
  userId?: number;
  username?: string;
}
