package com.cotowork.userservice.service;

import com.cotowork.userservice.entity.UserRole;
import com.cotowork.userservice.repository.UserRepository;
import com.cotowork.userservice.security.Permission;
import com.cotowork.userservice.security.RolePermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Role Management Service
 * Provides role and permission management capabilities
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RoleService {

    private final RolePermissionService rolePermissionService;
    private final UserRepository userRepository;

    /**
     * Get all available roles
     */
    public List<UserRole> getAllRoles() {
        log.info("Fetching all available roles");
        return Arrays.asList(UserRole.values());
    }

    /**
     * Get all available permissions
     */
    public List<Permission> getAllPermissions() {
        log.info("Fetching all available permissions");
        return Arrays.asList(Permission.values());
    }

    /**
     * Get permissions for a specific role
     */
    public List<String> getPermissionsForRole(UserRole role) {
        log.info("Fetching permissions for role: {}", role);
        return rolePermissionService.getPermissionsForRole(role);
    }

    /**
     * Get role hierarchy and descriptions
     */
    public Map<String, Object> getRoleHierarchy() {
        log.info("Building role hierarchy");
        
        Map<String, Object> hierarchy = new LinkedHashMap<>();
        
        // Define role hierarchy (highest to lowest)
        List<Map<String, Object>> roles = new ArrayList<>();
        
        // ADMIN
        Map<String, Object> admin = new HashMap<>();
        admin.put("role", UserRole.ADMIN);
        admin.put("level", 1);
        admin.put("description", "System Administrator - Full access to all system functions");
        admin.put("permissionCount", rolePermissionService.getPermissionsForRole(UserRole.ADMIN).size());
        admin.put("canManage", List.of(UserRole.UNIT_MANAGER, UserRole.STAFF, UserRole.VIEWER));
        roles.add(admin);
        
        // UNIT_MANAGER
        Map<String, Object> unitManager = new HashMap<>();
        unitManager.put("role", UserRole.UNIT_MANAGER);
        unitManager.put("level", 2);
        unitManager.put("description", "Unit Manager - Manage users and resources within their unit");
        unitManager.put("permissionCount", rolePermissionService.getPermissionsForRole(UserRole.UNIT_MANAGER).size());
        unitManager.put("canManage", List.of(UserRole.STAFF, UserRole.VIEWER));
        roles.add(unitManager);
        
        // STAFF
        Map<String, Object> staff = new HashMap<>();
        staff.put("role", UserRole.STAFF);
        staff.put("level", 3);
        staff.put("description", "Staff - Standard user with operational access");
        staff.put("permissionCount", rolePermissionService.getPermissionsForRole(UserRole.STAFF).size());
        staff.put("canManage", List.of());
        roles.add(staff);
        
        // VIEWER
        Map<String, Object> viewer = new HashMap<>();
        viewer.put("role", UserRole.VIEWER);
        viewer.put("level", 4);
        viewer.put("description", "Viewer - Read-only access to system resources");
        viewer.put("permissionCount", rolePermissionService.getPermissionsForRole(UserRole.VIEWER).size());
        viewer.put("canManage", List.of());
        roles.add(viewer);
        
        hierarchy.put("roles", roles);
        hierarchy.put("totalRoles", roles.size());
        
        return hierarchy;
    }

    /**
     * Check if a role has a specific permission
     */
    public boolean hasPermission(UserRole role, String permission) {
        log.info("Checking if role {} has permission {}", role, permission);
        return rolePermissionService.hasPermission(role, permission);
    }

    /**
     * Compare two roles and return permission differences
     */
    public Map<String, Object> compareRoles(UserRole role1, UserRole role2) {
        log.info("Comparing roles {} and {}", role1, role2);
        
        List<String> role1Permissions = rolePermissionService.getPermissionsForRole(role1);
        List<String> role2Permissions = rolePermissionService.getPermissionsForRole(role2);
        
        Set<String> role1Set = new HashSet<>(role1Permissions);
        Set<String> role2Set = new HashSet<>(role2Permissions);
        
        // Common permissions
        Set<String> common = new HashSet<>(role1Set);
        common.retainAll(role2Set);
        
        // Permissions only in role1
        Set<String> onlyInRole1 = new HashSet<>(role1Set);
        onlyInRole1.removeAll(role2Set);
        
        // Permissions only in role2
        Set<String> onlyInRole2 = new HashSet<>(role2Set);
        onlyInRole2.removeAll(role1Set);
        
        Map<String, Object> comparison = new HashMap<>();
        comparison.put("role1", role1);
        comparison.put("role2", role2);
        comparison.put("role1PermissionCount", role1Permissions.size());
        comparison.put("role2PermissionCount", role2Permissions.size());
        comparison.put("commonPermissions", common.stream().sorted().collect(Collectors.toList()));
        comparison.put("commonPermissionCount", common.size());
        comparison.put("onlyInRole1", onlyInRole1.stream().sorted().collect(Collectors.toList()));
        comparison.put("onlyInRole1Count", onlyInRole1.size());
        comparison.put("onlyInRole2", onlyInRole2.stream().sorted().collect(Collectors.toList()));
        comparison.put("onlyInRole2Count", onlyInRole2.size());
        
        return comparison;
    }

    /**
     * Get users count by role
     */
    public Map<UserRole, Long> getRoleStats() {
        log.info("Fetching role statistics");
        
        Map<UserRole, Long> stats = new HashMap<>();
        for (UserRole role : UserRole.values()) {
            long count = userRepository.countByRole(role);
            stats.put(role, count);
        }
        
        return stats;
    }

    /**
     * Get permission categories
     */
    public Map<String, List<String>> getPermissionCategories() {
        log.info("Organizing permissions by category");
        
        Map<String, List<String>> categories = new HashMap<>();
        
        // User Management
        categories.put("User Management", List.of(
                Permission.USER_READ.getPermission(),
                Permission.USER_CREATE.getPermission(),
                Permission.USER_UPDATE.getPermission(),
                Permission.USER_DELETE.getPermission(),
                Permission.USER_MANAGE_ALL.getPermission()
        ));
        
        // Unit Management
        categories.put("Unit Management", List.of(
                Permission.UNIT_READ.getPermission(),
                Permission.UNIT_CREATE.getPermission(),
                Permission.UNIT_UPDATE.getPermission(),
                Permission.UNIT_DELETE.getPermission(),
                Permission.UNIT_MANAGE_ALL.getPermission()
        ));
        
        // Task Management
        categories.put("Task Management", List.of(
                Permission.TASK_READ.getPermission(),
                Permission.TASK_CREATE.getPermission(),
                Permission.TASK_UPDATE.getPermission(),
                Permission.TASK_DELETE.getPermission(),
                Permission.TASK_ASSIGN.getPermission(),
                Permission.TASK_MANAGE_ALL.getPermission()
        ));
        
        // News Management
        categories.put("News Management", List.of(
                Permission.NEWS_READ.getPermission(),
                Permission.NEWS_CREATE.getPermission(),
                Permission.NEWS_UPDATE.getPermission(),
                Permission.NEWS_DELETE.getPermission(),
                Permission.NEWS_PUBLISH.getPermission(),
                Permission.NEWS_MANAGE_ALL.getPermission()
        ));
        
        // File Management
        categories.put("File Management", List.of(
                Permission.FILE_READ.getPermission(),
                Permission.FILE_UPLOAD.getPermission(),
                Permission.FILE_DELETE.getPermission(),
                Permission.FILE_MANAGE_ALL.getPermission()
        ));
        
        // Project Management
        categories.put("Project Management", List.of(
                Permission.PROJECT_READ.getPermission(),
                Permission.PROJECT_CREATE.getPermission(),
                Permission.PROJECT_UPDATE.getPermission(),
                Permission.PROJECT_DELETE.getPermission(),
                Permission.PROJECT_MANAGE_ALL.getPermission()
        ));
        
        // Analytics
        categories.put("Analytics", List.of(
                Permission.ANALYTICS_READ.getPermission(),
                Permission.ANALYTICS_MANAGE.getPermission()
        ));
        
        // System Administration
        categories.put("System Administration", List.of(
                Permission.SYSTEM_ADMIN.getPermission(),
                Permission.SYSTEM_MONITOR.getPermission()
        ));
        
        return categories;
    }
}