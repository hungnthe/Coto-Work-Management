package com.cotowork.userservice.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cotowork.userservice.dto.PasswordChangeDto;
import com.cotowork.userservice.dto.UserPermissionsDto;
import com.cotowork.userservice.dto.UserResponseDto;
import com.cotowork.userservice.dto.UserUpdateDto;
import com.cotowork.userservice.entity.User;
import com.cotowork.userservice.exception.ErrorCode;
import com.cotowork.userservice.exception.ResourceNotFoundException;
import com.cotowork.userservice.exception.ValidationException;
import com.cotowork.userservice.mapper.UserMapper;
import com.cotowork.userservice.repository.UserRepository;
import com.cotowork.userservice.security.RolePermissionService;
import com.cotowork.userservice.security.SecurityUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Account Management Service
 * Provides self-service account management capabilities
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AccountService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RolePermissionService rolePermissionService;

    // --- HÀM PHỤ TRỢ (Dùng chung cho cả class để tránh lặp code) ---
    private User getUserOrThrow() {
        String currentUsername = SecurityUtils.getCurrentUsername().orElse(null);
        
        if (currentUsername == null) {
            throw new ResourceNotFoundException(ErrorCode.UNAUTHENTICATED); 
        }

        return userRepository.findByUsernameAndIsActiveTrue(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_EXISTED));
    }
    // ---------------------------------------------------------------

    /**
     * Get current user's profile
     */
    @Transactional(readOnly = true)
    public UserResponseDto getCurrentUserProfile() {
        User user = getUserOrThrow();
        log.info("Fetching profile for current user: {}", user.getUsername());
        return userMapper.toResponseDto(user);
    }

    /**
     * Update current user's profile
     */
    public UserResponseDto updateCurrentUserProfile(UserUpdateDto dto) {
        User user = getUserOrThrow();
        log.info("Updating profile for current user: {}", user.getUsername());

        // Check for duplicate email if email is being changed
        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new ValidationException(ErrorCode.EMAIL_EXISTED);
            }
            user.setEmail(dto.getEmail());
        }

        // Update allowed fields
        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getPhoneNumber() != null) user.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getAvatarUrl() != null) user.setAvatarUrl(dto.getAvatarUrl());

        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        log.info("Profile updated successfully for user: {}", user.getUsername());

        return userMapper.toResponseDto(savedUser);
    }

    /**
     * Change current user's password
     */
    public String changeCurrentUserPassword(PasswordChangeDto dto) {
        User user = getUserOrThrow();
        log.info("Changing password for current user: {}", user.getUsername());

        // Verify old password
        if (!passwordEncoder.matches(dto.getOldPassword(), user.getPasswordHash())) {
            throw new ValidationException(ErrorCode.INVALID_PASSWORD);
        }

        // Ensure new password is different
        if (passwordEncoder.matches(dto.getNewPassword(), user.getPasswordHash())) {
            throw new ValidationException(ErrorCode.PASSWORD_MUST_BE_DIFFERENT);
        }

        // Validate confirm password
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new ValidationException(ErrorCode.VALIDATION_FAILED, "New password and confirm password do not match");
        }

        user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        log.info("Password changed successfully for user: {}", user.getUsername());
        
        return "Password changed successfully";
    }

    /**
     * Get current user's permissions
     */
    @Transactional(readOnly = true)
    public UserPermissionsDto getCurrentUserPermissions() {
        User user = getUserOrThrow();
        log.info("Fetching permissions for current user: {}", user.getUsername());
        
        List<String> permissions = rolePermissionService.getPermissionsForRole(user.getRole());

        return UserPermissionsDto.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .permissions(permissions)
                .isActive(user.getIsActive())
                .build();
    }

    /**
     * Get current user's activity log
     */
    @Transactional(readOnly = true)
    public List<String> getCurrentUserActivityLog() {
        User user = getUserOrThrow();
        log.info("Fetching activity log for current user: {}", user.getUsername());

        // This would require activity log table/entity
        // For now, return basic info
        return List.of(
                "Account created: " + user.getCreatedAt(),
                "Last profile update: " + user.getUpdatedAt(),
                "Current status: " + (Boolean.TRUE.equals(user.getIsActive()) ? "Active" : "Inactive"),
                "Current role: " + user.getRole()
        );
    }

    /**
     * Get current user's sessions
     */
    @Transactional(readOnly = true)
    public List<String> getCurrentUserSessions() {
        User user = getUserOrThrow();
        log.info("Fetching sessions for current user: {}", user.getUsername());

        // This would require session management
        // For now, return current session info
        return List.of(
                "Current session: Active since " + LocalDateTime.now().minusHours(2),
                "Session type: Web Browser",
                "IP Address: 192.168.1.100" // Mock data
        );
    }

    /**
     * Deactivate current user's account
     */
    public void deactivateCurrentUserAccount(String reason) {
        User user = getUserOrThrow();
        log.info("Deactivating account for current user: {} with reason: {}", user.getUsername(), reason);

        user.setIsActive(false);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        log.info("Account deactivated successfully for user: {}", user.getUsername());
    }

    /**
     * Request account deletion
     */
    public String requestAccountDeletion(String reason) {
        User user = getUserOrThrow();
        log.info("Account deletion requested by user: {} with reason: {}", user.getUsername(), reason);

        // Generate request ID
        String requestId = "DEL-" + user.getId() + "-" + System.currentTimeMillis();

        // This would require deletion request table/entity
        // For now, just log the request
        log.info("Account deletion request created with ID: {} for user: {}", requestId, user.getUsername());

        return requestId;
    }

    /**
     * Get account settings
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAccountSettings() {
        User user = getUserOrThrow();
        log.info("Fetching account settings for current user: {}", user.getUsername());

        Map<String, Object> settings = new HashMap<>();
        settings.put("username", user.getUsername());
        settings.put("email", user.getEmail());
        settings.put("fullName", user.getFullName());
        settings.put("phoneNumber", user.getPhoneNumber());
        settings.put("avatarUrl", user.getAvatarUrl());
        settings.put("role", user.getRole());
        settings.put("isActive", user.getIsActive());
        settings.put("createdAt", user.getCreatedAt());
        settings.put("updatedAt", user.getUpdatedAt());

        // Additional settings (would be stored in separate table)
        settings.put("notifications", Map.of(
                "email", true,
                "push", false,
                "sms", false
        ));
        settings.put("privacy", Map.of(
                "profileVisible", true,
                "showEmail", false,
                "showPhone", false
        ));
        settings.put("preferences", Map.of(
                "language", "vi",
                "timezone", "Asia/Ho_Chi_Minh",
                "dateFormat", "dd/MM/yyyy"
        ));

        return settings;
    }

    /**
     * Update account settings
     */
    public Map<String, Object> updateAccountSettings(Map<String, Object> settings) {
        User user = getUserOrThrow();
        log.info("Updating account settings for current user: {}", user.getUsername());

        // Update basic profile fields if provided
        if (settings.containsKey("fullName")) {
            user.setFullName((String) settings.get("fullName"));
        }
        if (settings.containsKey("phoneNumber")) {
            user.setPhoneNumber((String) settings.get("phoneNumber"));
        }
        if (settings.containsKey("avatarUrl")) {
            user.setAvatarUrl((String) settings.get("avatarUrl"));
        }

        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Additional settings would be saved to separate table
        log.info("Account settings updated successfully for user: {}", user.getUsername());

        return getAccountSettings(); // Return updated settings
    }
}