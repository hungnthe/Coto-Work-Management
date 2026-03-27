package com.cotowork.userservice.controller;

import com.cotowork.userservice.dto.*;
import com.cotowork.userservice.entity.UserRole;
import com.cotowork.userservice.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin User Management Controller
 * Provides advanced user management capabilities for administrators
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Slf4j
public class AdminUserController {

    private final AdminUserService adminUserService;

    /**
     * Create user with admin privileges
     */
    @PostMapping
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody UserAdminCreateDto dto) {
        log.info("Admin creating user: {}", dto.getUsername());
        UserResponseDto user = adminUserService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    /**
     * Get all users with pagination and filtering
     */
    @GetMapping
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<Page<UserResponseDto>> getAllUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Long unitId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        
        log.info("Admin fetching users with filters - role: {}, unitId: {}, isActive: {}, search: {}", 
                role, unitId, isActive, search);
        
        Page<UserResponseDto> users = adminUserService.getAllUsers(role, unitId, isActive, search, pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Update user with admin privileges
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserAdminUpdateDto dto) {
        
        log.info("Admin updating user ID: {}", id);
        UserResponseDto user = adminUserService.updateUser(id, dto);
        return ResponseEntity.ok(user);
    }

    /**
     * Change user role
     */
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<UserResponseDto> changeUserRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleChangeDto dto) {
        
        log.info("Admin changing role for user ID: {} to role: {}", id, dto.getNewRole());
        UserResponseDto user = adminUserService.changeUserRole(id, dto);
        return ResponseEntity.ok(user);
    }

    /**
     * Activate user account
     */
    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<Void> activateUser(@PathVariable Long id) {
        log.info("Admin activating user ID: {}", id);
        adminUserService.activateUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Deactivate user account
     */
    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        log.info("Admin deactivating user ID: {}", id);
        adminUserService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Reset user password (generates temporary password)
     */
    @PatchMapping("/{id}/reset-password")
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<String> resetUserPassword(@PathVariable Long id) {
        log.info("Admin resetting password for user ID: {}", id);
        String tempPassword = adminUserService.resetUserPassword(id);
        return ResponseEntity.ok(tempPassword);
    }

    /**
     * Force password change on next login
     */
    @PatchMapping("/{id}/force-password-change")
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<Void> forcePasswordChange(@PathVariable Long id) {
        log.info("Admin forcing password change for user ID: {}", id);
        adminUserService.forcePasswordChange(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get user permissions
     */
    @GetMapping("/{id}/permissions")
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<UserPermissionsDto> getUserPermissions(@PathVariable Long id) {
        log.info("Admin fetching permissions for user ID: {}", id);
        UserPermissionsDto permissions = adminUserService.getUserPermissions(id);
        return ResponseEntity.ok(permissions);
    }

    /**
     * Bulk user operations
     */
    @PostMapping("/bulk")
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<String> bulkUserOperation(@Valid @RequestBody BulkUserOperationDto dto) {
        log.info("Admin performing bulk operation: {} on {} users", dto.getOperation(), dto.getUserIds().size());
        String result = adminUserService.bulkUserOperation(dto);
        return ResponseEntity.ok(result);
    }

    /**
     * Get user statistics
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<UserStatsDto> getUserStats() {
        log.info("Admin fetching user statistics");
        UserStatsDto stats = adminUserService.getUserStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Get users by role
     */
    @GetMapping("/role/{role}")
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<List<UserResponseDto>> getUsersByRole(@PathVariable UserRole role) {
        log.info("Admin fetching users by role: {}", role);
        List<UserResponseDto> users = adminUserService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    /**
     * Get inactive users (for cleanup/review)
     */
    @GetMapping("/inactive")
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<List<UserResponseDto>> getInactiveUsers(
            @RequestParam(defaultValue = "30") int daysInactive) {
        
        log.info("Admin fetching users inactive for {} days", daysInactive);
        List<UserResponseDto> users = adminUserService.getInactiveUsers(daysInactive);
        return ResponseEntity.ok(users);
    }

    /**
     * Get users with expiring accounts
     */
    @GetMapping("/expiring")
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<List<UserResponseDto>> getExpiringUsers(
            @RequestParam(defaultValue = "30") int daysUntilExpiry) {
        
        log.info("Admin fetching users with accounts expiring in {} days", daysUntilExpiry);
        List<UserResponseDto> users = adminUserService.getExpiringUsers(daysUntilExpiry);
        return ResponseEntity.ok(users);
    }

    /**
     * Export users data (CSV format)
     */
    @GetMapping("/export")
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<String> exportUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Long unitId,
            @RequestParam(required = false) Boolean isActive) {
        
        log.info("Admin exporting users data");
        String csvData = adminUserService.exportUsers(role, unitId, isActive);
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=users.csv")
                .body(csvData);
    }

    /**
     * Get audit log for user changes
     */
    @GetMapping("/{id}/audit")
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<List<String>> getUserAuditLog(@PathVariable Long id) {
        log.info("Admin fetching audit log for user ID: {}", id);
        List<String> auditLog = adminUserService.getUserAuditLog(id);
        return ResponseEntity.ok(auditLog);
    }
}