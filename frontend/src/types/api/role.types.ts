import { UserRole, Permission } from './common.types';

// Response DTOs
export interface RoleDto {
  name: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
  level: number;
}

export interface PermissionDto {
  name: Permission;
  displayName: string;
  description: string;
  category: string;
}

export interface RoleHierarchyDto {
  roles: Array<{
    role: UserRole;
    level: number;
    canManage: UserRole[];
  }>;
}

export interface RoleComparisonDto {
  role1: UserRole;
  role2: UserRole;
  commonPermissions: Permission[];
  role1OnlyPermissions: Permission[];
  role2OnlyPermissions: Permission[];
}

export interface RoleStatsDto {
  totalRoles: number;
  roleDistribution: Record<string, number>;
  permissionUsage: Record<string, number>;
}

export interface HasPermissionDto {
  role: UserRole;
  permission: Permission;
  hasPermission: boolean;
}
