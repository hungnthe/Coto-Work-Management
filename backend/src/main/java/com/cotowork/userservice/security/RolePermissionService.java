package com.cotowork.userservice.security;

import com.cotowork.userservice.entity.UserRole;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

/**
 * Service to manage role-based permissions
 * Maps UserRole enum to specific permissions
 */
@Service
public class RolePermissionService {

    /**
     * Get permissions for a specific role
     */
    public List<String> getPermissionsForRole(UserRole role) {
        return switch (role) {
            case ADMIN -> getAdminPermissions();
            case UNIT_MANAGER -> getUnitManagerPermissions();
            case STAFF -> getStaffPermissions();
            case VIEWER -> getViewerPermissions();
        };
    }

    /**
     * Admin permissions - full system access
     */
    private List<String> getAdminPermissions() {
        return List.of(
            // System Administration
            Permission.SYSTEM_ADMIN.getPermission(),
            Permission.SYSTEM_MONITOR.getPermission(),
            
            // User Management - Full Access
            Permission.USER_READ.getPermission(),
            Permission.USER_CREATE.getPermission(),
            Permission.USER_UPDATE.getPermission(),
            Permission.USER_DELETE.getPermission(),
            Permission.USER_MANAGE_ALL.getPermission(),
            
            // Unit Management - Full Access
            Permission.UNIT_READ.getPermission(),
            Permission.UNIT_CREATE.getPermission(),
            Permission.UNIT_UPDATE.getPermission(),
            Permission.UNIT_DELETE.getPermission(),
            Permission.UNIT_MANAGE_ALL.getPermission(),
            
            // Task Management - Full Access
            Permission.TASK_READ.getPermission(),
            Permission.TASK_CREATE.getPermission(),
            Permission.TASK_UPDATE.getPermission(),
            Permission.TASK_DELETE.getPermission(),
            Permission.TASK_ASSIGN.getPermission(),
            Permission.TASK_MANAGE_ALL.getPermission(),
            
            // News Management - Full Access
            Permission.NEWS_READ.getPermission(),
            Permission.NEWS_CREATE.getPermission(),
            Permission.NEWS_UPDATE.getPermission(),
            Permission.NEWS_DELETE.getPermission(),
            Permission.NEWS_PUBLISH.getPermission(),
            Permission.NEWS_MANAGE_ALL.getPermission(),
            
            // File Management - Full Access
            Permission.FILE_READ.getPermission(),
            Permission.FILE_UPLOAD.getPermission(),
            Permission.FILE_DELETE.getPermission(),
            Permission.FILE_MANAGE_ALL.getPermission(),
            
            // Project Management - Full Access
            Permission.PROJECT_READ.getPermission(),
            Permission.PROJECT_CREATE.getPermission(),
            Permission.PROJECT_UPDATE.getPermission(),
            Permission.PROJECT_DELETE.getPermission(),
            Permission.PROJECT_MANAGE_ALL.getPermission(),
            
            // Analytics - Full Access
            Permission.ANALYTICS_READ.getPermission(),
            Permission.ANALYTICS_MANAGE.getPermission()
        );
    }

    /**
     * Unit Manager permissions - manage their unit and related resources
     */
    private List<String> getUnitManagerPermissions() {
        return List.of(
            // System Monitoring
            Permission.SYSTEM_MONITOR.getPermission(),
            
            // User Management - Limited to their unit
            Permission.USER_READ.getPermission(),
            Permission.USER_CREATE.getPermission(),
            Permission.USER_UPDATE.getPermission(),
            
            // Unit Management - Limited to their unit
            Permission.UNIT_READ.getPermission(),
            Permission.UNIT_UPDATE.getPermission(),
            
            // Task Management - Full access for their unit
            Permission.TASK_READ.getPermission(),
            Permission.TASK_CREATE.getPermission(),
            Permission.TASK_UPDATE.getPermission(),
            Permission.TASK_DELETE.getPermission(),
            Permission.TASK_ASSIGN.getPermission(),
            Permission.TASK_MANAGE_ALL.getPermission(),
            
            // News Management - Can create and manage news
            Permission.NEWS_READ.getPermission(),
            Permission.NEWS_CREATE.getPermission(),
            Permission.NEWS_UPDATE.getPermission(),
            Permission.NEWS_DELETE.getPermission(),
            Permission.NEWS_PUBLISH.getPermission(),
            Permission.NEWS_MANAGE_ALL.getPermission(),
            
            // File Management - Upload and manage files
            Permission.FILE_READ.getPermission(),
            Permission.FILE_UPLOAD.getPermission(),
            Permission.FILE_DELETE.getPermission(),
            
            // Project Management - Manage projects in their unit
            Permission.PROJECT_READ.getPermission(),
            Permission.PROJECT_CREATE.getPermission(),
            Permission.PROJECT_UPDATE.getPermission(),
            Permission.PROJECT_DELETE.getPermission(),
            Permission.PROJECT_MANAGE_ALL.getPermission(),
            
            // Analytics - Read and manage analytics for their unit
            Permission.ANALYTICS_READ.getPermission(),
            Permission.ANALYTICS_MANAGE.getPermission()
        );
    }

    /**
     * Staff permissions - basic operational access
     */
    private List<String> getStaffPermissions() {
        return List.of(
            // User Management - Read only, update own profile
            Permission.USER_READ.getPermission(),
            Permission.USER_UPDATE.getPermission(), // Limited to own profile
            
            // Unit Management - Read only
            Permission.UNIT_READ.getPermission(),
            
            // Task Management - Create, read, update assigned tasks
            Permission.TASK_READ.getPermission(),
            Permission.TASK_CREATE.getPermission(),
            Permission.TASK_UPDATE.getPermission(),
            
            // News Management - Read and create news
            Permission.NEWS_READ.getPermission(),
            Permission.NEWS_CREATE.getPermission(),
            Permission.NEWS_UPDATE.getPermission(),
            
            // File Management - Upload and read files
            Permission.FILE_READ.getPermission(),
            Permission.FILE_UPLOAD.getPermission(),
            
            // Project Management - Read and update assigned projects
            Permission.PROJECT_READ.getPermission(),
            Permission.PROJECT_UPDATE.getPermission(),
            
            // Analytics - Read only
            Permission.ANALYTICS_READ.getPermission()
        );
    }

    /**
     * Viewer permissions - read-only access
     */
    private List<String> getViewerPermissions() {
        return List.of(
            // User Management - Read only
            Permission.USER_READ.getPermission(),
            
            // Unit Management - Read only
            Permission.UNIT_READ.getPermission(),
            
            // Task Management - Read only
            Permission.TASK_READ.getPermission(),
            
            // News Management - Read only
            Permission.NEWS_READ.getPermission(),
            
            // File Management - Read only
            Permission.FILE_READ.getPermission(),
            
            // Project Management - Read only
            Permission.PROJECT_READ.getPermission(),
            
            // Analytics - Read only
            Permission.ANALYTICS_READ.getPermission()
        );
    }

    /**
     * Check if a role has a specific permission
     */
    public boolean hasPermission(UserRole role, String permission) {
        return getPermissionsForRole(role).contains(permission);
    }

    /**
     * Check if a role has any of the specified permissions
     */
    public boolean hasAnyPermission(UserRole role, String... permissions) {
        List<String> rolePermissions = getPermissionsForRole(role);
        return Set.of(permissions).stream()
                .anyMatch(rolePermissions::contains);
    }
}