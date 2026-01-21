package com.cotowork.userservice.security;

/**
 * System permissions for Role-Based Access Control (RBAC)
 * These permissions are used across all microservices
 */
public enum Permission {
    
    // User Management Permissions
    USER_READ("user:read"),
    USER_CREATE("user:create"),
    USER_UPDATE("user:update"),
    USER_DELETE("user:delete"),
    USER_MANAGE_ALL("user:manage_all"), // Admin only
    
    // Unit Management Permissions
    UNIT_READ("unit:read"),
    UNIT_CREATE("unit:create"),
    UNIT_UPDATE("unit:update"),
    UNIT_DELETE("unit:delete"),
    UNIT_MANAGE_ALL("unit:manage_all"), // Admin only
    
    // Task Management Permissions
    TASK_READ("task:read"),
    TASK_CREATE("task:create"),
    TASK_UPDATE("task:update"),
    TASK_DELETE("task:delete"),
    TASK_ASSIGN("task:assign"),
    TASK_MANAGE_ALL("task:manage_all"), // Admin and Unit Manager
    
    // News Management Permissions
    NEWS_READ("news:read"),
    NEWS_CREATE("news:create"),
    NEWS_UPDATE("news:update"),
    NEWS_DELETE("news:delete"),
    NEWS_PUBLISH("news:publish"),
    NEWS_MANAGE_ALL("news:manage_all"), // Admin and Unit Manager
    
    // File Management Permissions
    FILE_READ("file:read"),
    FILE_UPLOAD("file:upload"),
    FILE_DELETE("file:delete"),
    FILE_MANAGE_ALL("file:manage_all"), // Admin only
    
    // Project Management Permissions
    PROJECT_READ("project:read"),
    PROJECT_CREATE("project:create"),
    PROJECT_UPDATE("project:update"),
    PROJECT_DELETE("project:delete"),
    PROJECT_MANAGE_ALL("project:manage_all"), // Admin and Unit Manager
    
    // Analytics Permissions
    ANALYTICS_READ("analytics:read"),
    ANALYTICS_MANAGE("analytics:manage"), // Admin and Unit Manager
    
    // System Administration Permissions
    SYSTEM_ADMIN("system:admin"), // Full system access
    SYSTEM_MONITOR("system:monitor"); // Read-only system monitoring
    
    private final String permission;
    
    Permission(String permission) {
        this.permission = permission;
    }
    
    public String getPermission() {
        return permission;
    }
    
    @Override
    public String toString() {
        return permission;
    }
}