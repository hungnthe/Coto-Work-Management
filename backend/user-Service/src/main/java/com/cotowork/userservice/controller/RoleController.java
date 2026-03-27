package com.cotowork.userservice.controller;

import com.cotowork.userservice.entity.UserRole;
import com.cotowork.userservice.security.Permission;
import com.cotowork.userservice.service.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Role Management Controller
 * Provides role and permission management capabilities
 */
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Slf4j
public class RoleController {

    private final RoleService roleService;

    /**
     * Get all available roles
     */
    @GetMapping
    @PreAuthorize("hasAuthority('user:read')")
    public ResponseEntity<List<UserRole>> getAllRoles() {
        log.info("Fetching all available roles");
        List<UserRole> roles = roleService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    /**
     * Get all available permissions
     */
    @GetMapping("/permissions")
    @PreAuthorize("hasAuthority('user:read')")
    public ResponseEntity<List<Permission>> getAllPermissions() {
        log.info("Fetching all available permissions");
        List<Permission> permissions = roleService.getAllPermissions();
        return ResponseEntity.ok(permissions);
    }

    /**
     * Get permissions for a specific role
     */
    @GetMapping("/{role}/permissions")
    @PreAuthorize("hasAuthority('user:read')")
    public ResponseEntity<List<String>> getRolePermissions(@PathVariable UserRole role) {
        log.info("Fetching permissions for role: {}", role);
        List<String> permissions = roleService.getPermissionsForRole(role);
        return ResponseEntity.ok(permissions);
    }

    /**
     * Get role hierarchy and descriptions
     */
    @GetMapping("/hierarchy")
    @PreAuthorize("hasAuthority('user:read')")
    public ResponseEntity<Map<String, Object>> getRoleHierarchy() {
        log.info("Fetching role hierarchy");
        Map<String, Object> hierarchy = roleService.getRoleHierarchy();
        return ResponseEntity.ok(hierarchy);
    }

    /**
     * Check if a role has a specific permission
     */
    @GetMapping("/{role}/has-permission/{permission}")
    @PreAuthorize("hasAuthority('user:read')")
    public ResponseEntity<Boolean> hasPermission(
            @PathVariable UserRole role,
            @PathVariable String permission) {
        
        log.info("Checking if role {} has permission {}", role, permission);
        boolean hasPermission = roleService.hasPermission(role, permission);
        return ResponseEntity.ok(hasPermission);
    }

    /**
     * Get role comparison (permissions diff between two roles)
     */
    @GetMapping("/compare")
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<Map<String, Object>> compareRoles(
            @RequestParam UserRole role1,
            @RequestParam UserRole role2) {
        
        log.info("Comparing roles {} and {}", role1, role2);
        Map<String, Object> comparison = roleService.compareRoles(role1, role2);
        return ResponseEntity.ok(comparison);
    }

    /**
     * Get users count by role
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('user:read')")
    public ResponseEntity<Map<UserRole, Long>> getRoleStats() {
        log.info("Fetching role statistics");
        Map<UserRole, Long> stats = roleService.getRoleStats();
        return ResponseEntity.ok(stats);
    }
}