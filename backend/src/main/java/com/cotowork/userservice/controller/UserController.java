package com.cotowork.userservice.controller;

import com.cotowork.userservice.dto.*;
import com.cotowork.userservice.entity.UserRole;
import com.cotowork.userservice.security.SecurityUtils;
import com.cotowork.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * REST Controller for User management
 * CRITICAL: All responses use DTOs that NEVER include password field
 * Uses Role-Based Access Control (RBAC) for authorization
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    
    private final UserService userService;
    
    @GetMapping
    @PreAuthorize("hasAuthority('user:read')")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        log.info("GET /api/users - Fetching all users");
        List<UserResponseDto> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('user:read')")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        log.info("GET /api/users/{} - Fetching user by id", id);
        UserResponseDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/username/{username}")
    @PreAuthorize("hasAuthority('user:read')")
    public ResponseEntity<UserResponseDto> getUserByUsername(@PathVariable String username) {
        log.info("GET /api/users/username/{} - Fetching user by username", username);
        UserResponseDto user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping
    @PreAuthorize("hasAuthority('user:create')")
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody UserCreateDto dto) {
        log.info("POST /api/users - Creating new user");
        UserResponseDto user = userService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('user:update') or (authentication.name == @userService.getUserById(#id).username)")
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateDto dto) {
        log.info("PUT /api/users/{} - Updating user", id);
        UserResponseDto user = userService.updateUser(id, dto);
        return ResponseEntity.ok(user);
    }
    
    @PatchMapping("/{id}/password")
    @PreAuthorize("hasAuthority('user:update') or (authentication.name == @userService.getUserById(#id).username)")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @RequestBody PasswordChangeDto dto) {
        log.info("PATCH /api/users/{}/password - Changing password", id);
        userService.changePassword(id, dto.getOldPassword(), dto.getNewPassword());
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('user:delete')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("DELETE /api/users/{} - Deleting user", id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/unit/{unitId}")
    @PreAuthorize("hasAuthority('user:read')")
    public ResponseEntity<List<UserResponseDto>> getUsersByUnit(@PathVariable Long unitId) {
        log.info("GET /api/users/unit/{} - Fetching users by unit", unitId);
        List<UserResponseDto> users = userService.getUsersByUnit(unitId);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/role/{role}")
    @PreAuthorize("hasAuthority('user:manage_all')")
    public ResponseEntity<List<UserResponseDto>> getUsersByRole(@PathVariable UserRole role) {
        log.info("GET /api/users/role/{} - Fetching users by role", role);
        List<UserResponseDto> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/search")
    @PreAuthorize("hasAuthority('user:read')")
    public ResponseEntity<List<UserResponseDto>> searchUsers(@RequestParam String keyword) {
        log.info("GET /api/users/search?keyword={} - Searching users", keyword);
        List<UserResponseDto> users = userService.searchUsers(keyword);
        return ResponseEntity.ok(users);
    }
    
    /**
     * Get current user profile
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponseDto> getCurrentUser() {
        String username = SecurityUtils.getCurrentUsername()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated"));
        
        log.info("GET /api/users/me - Fetching current user profile for: {}", username);
        UserResponseDto user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }
    
    /**
     * Update current user profile
     */
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponseDto> updateCurrentUser(@Valid @RequestBody UserUpdateDto dto) {
        String username = SecurityUtils.getCurrentUsername()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated"));

        Long userId = userService.getUserByUsername(username).getId();
        
        log.info("PUT /api/users/me - Updating current user profile for user ID: {}", userId);
        UserResponseDto user = userService.updateUser(userId, dto);
        return ResponseEntity.ok(user);
    }
}
