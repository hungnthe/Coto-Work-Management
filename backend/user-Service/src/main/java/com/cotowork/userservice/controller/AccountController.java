package com.cotowork.userservice.controller;

import com.cotowork.userservice.dto.PasswordChangeDto;
import com.cotowork.userservice.dto.UserPermissionsDto;
import com.cotowork.userservice.dto.UserResponseDto;
import com.cotowork.userservice.dto.UserUpdateDto;
import com.cotowork.userservice.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Account Management Controller
 * Provides self-service account management capabilities
 */
@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Account (Me)", description = "Quản lý thông tin cá nhân của người dùng đang đăng nhập.")
public class AccountController {

    private final AccountService accountService;

    /**
     * Get current user's profile
     */
    @Operation(summary = "Xem thông tin cá nhân", description = "Trả về profile đầy đủ của user hiện tại.")
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponseDto> getProfile() {
        log.info("User fetching own profile");
        UserResponseDto profile = accountService.getCurrentUserProfile();
        return ResponseEntity.ok(profile);
    }

    /**
     * Update current user's profile
     */
    @Operation(summary = "Cập nhật hồ sơ", description = "Cho phép user tự sửa tên, bio, avatar...")
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponseDto> updateProfile(@Valid @RequestBody UserUpdateDto dto) {
        log.info("User updating own profile");
        UserResponseDto profile = accountService.updateCurrentUserProfile(dto);
        return ResponseEntity.ok(profile);
    }

    /**
     * Change current user's password
     */
    @PatchMapping("/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody PasswordChangeDto dto) {
        log.info("User changing own password");
        String message = accountService.changeCurrentUserPassword(dto);
        return ResponseEntity.ok(Map.of("message", message));
    }

    /**
     * Get current user's permissions
     */
    @GetMapping("/permissions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserPermissionsDto> getPermissions() {
        log.info("User fetching own permissions");
        UserPermissionsDto permissions = accountService.getCurrentUserPermissions();
        return ResponseEntity.ok(permissions);
    }

    /**
     * Get current user's activity log
     */
    @GetMapping("/activity")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<String>> getActivityLog() {
        log.info("User fetching own activity log");
        List<String> activities = accountService.getCurrentUserActivityLog();
        return ResponseEntity.ok(activities);
    }

    /**
     * Get current user's sessions
     */
    @GetMapping("/sessions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<String>> getSessions() {
        log.info("User fetching own sessions");
        List<String> sessions = accountService.getCurrentUserSessions();
        return ResponseEntity.ok(sessions);
    }

    /**
     * Deactivate current user's account (self-deactivation)
     */
    @PatchMapping("/deactivate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deactivateAccount(@RequestBody(required = false) String reason) {
        log.info("User deactivating own account");
        accountService.deactivateCurrentUserAccount(reason);
        return ResponseEntity.noContent().build();
    }

    /**
     * Request account deletion
     */
    @PostMapping("/delete-request")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> requestAccountDeletion(@RequestBody(required = false) String reason) {
        log.info("User requesting account deletion");
        String requestId = accountService.requestAccountDeletion(reason);
        return ResponseEntity.ok(requestId);
    }

    /**
     * Get account settings
     */
    @GetMapping("/settings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getAccountSettings() {
        log.info("User fetching account settings");
        Map<String, Object> settings = accountService.getAccountSettings();
        return ResponseEntity.ok(settings);
    }

    /**
     * Update account settings
     */
    @PutMapping("/settings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> updateAccountSettings(
            @RequestBody Map<String, Object> settings) {
        
        log.info("User updating account settings");
        Map<String, Object> updatedSettings = accountService.updateAccountSettings(settings);
        return ResponseEntity.ok(updatedSettings);
    }
}