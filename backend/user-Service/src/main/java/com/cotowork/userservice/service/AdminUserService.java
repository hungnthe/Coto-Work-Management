package com.cotowork.userservice.service;

import com.cotowork.userservice.dto.*;
import com.cotowork.userservice.entity.Unit;
import com.cotowork.userservice.entity.User;
import com.cotowork.userservice.entity.UserRole;
import com.cotowork.userservice.exception.DuplicateDataException;
import com.cotowork.userservice.exception.ErrorCode;
import com.cotowork.userservice.exception.ResourceNotFoundException;
import com.cotowork.userservice.mapper.UserMapper;
import com.cotowork.userservice.repository.UnitRepository;
import com.cotowork.userservice.repository.UserRepository;
import com.cotowork.userservice.security.RolePermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Admin User Management Service
 * Provides advanced user management capabilities for administrators
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminUserService {

    private final UserRepository userRepository;
    private final UnitRepository unitRepository; // Thêm UnitRepository để xử lý logic Unit
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RolePermissionService rolePermissionService;
    
    private static final String TEMP_PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    private static final SecureRandom random = new SecureRandom();

    /**
     * Create user with admin privileges
     */
    public UserResponseDto createUser(UserAdminCreateDto dto) {
        log.info("Creating user with admin privileges: {}", dto.getUsername());
        
        // Check for duplicate username
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new DuplicateDataException(ErrorCode.DUPLICATE_DATA);
        }
        
        // Check for duplicate email
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateDataException(ErrorCode.EMAIL_EXISTED);
        }

        // Fetch Unit logic
        Unit unit = unitRepository.findById(dto.getUnitId())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.RESOURCE_NOT_FOUND));
        
        User user = User.builder()
                .username(dto.getUsername())
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPassword()))
                .unit(unit) // Sửa: Set Object Unit thay vì ID
                .role(dto.getRole())
                .phoneNumber(dto.getPhoneNumber())
                .avatarUrl(dto.getAvatarUrl())
                .isActive(dto.getIsActive())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());
        
        return userMapper.toResponseDto(savedUser);
    }

    /**
     * Get all users with pagination and filtering
     */
    @Transactional(readOnly = true)
    public Page<UserResponseDto> getAllUsers(UserRole role, Long unitId, Boolean isActive, String search, Pageable pageable) {
        log.info("Fetching users with filters - role: {}, unitId: {}, isActive: {}, search: {}", 
                role, unitId, isActive, search);
        
        Page<User> users;
        
        if (search != null && !search.trim().isEmpty()) {
            users = userRepository.findByFiltersWithSearch(role, unitId, isActive, search.trim(), pageable);
        } else {
            users = userRepository.findByFilters(role, unitId, isActive, pageable);
        }
        
        return users.map(userMapper::toResponseDto);
    }

    /**
     * Update user with admin privileges
     */
    public UserResponseDto updateUser(Long id, UserAdminUpdateDto dto) {
        log.info("Updating user with admin privileges: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
        
        // Check for duplicate email if email is being changed
        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new DuplicateDataException(ErrorCode.EMAIL_EXISTED);
            }
            user.setEmail(dto.getEmail());
        }
        
        // Update fields if provided
        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        
        // Logic cập nhật Unit: Cần tìm Unit từ DB rồi mới set vào User
        if (dto.getUnitId() != null) {
            Unit unit = unitRepository.findById(dto.getUnitId())
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.RESOURCE_NOT_FOUND));
            user.setUnit(unit);
        }

        if (dto.getRole() != null) user.setRole(dto.getRole());
        if (dto.getPhoneNumber() != null) user.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getAvatarUrl() != null) user.setAvatarUrl(dto.getAvatarUrl());
        if (dto.getIsActive() != null) user.setIsActive(dto.getIsActive());
        
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("User updated successfully: {}", savedUser.getId());
        
        return userMapper.toResponseDto(savedUser);
    }

    /**
     * Change user role
     */
    public UserResponseDto changeUserRole(Long id, RoleChangeDto dto) {
        log.info("Changing role for user ID: {} to role: {}", id, dto.getNewRole());
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
        
        UserRole oldRole = user.getRole();
        user.setRole(dto.getNewRole());
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        log.info("User role changed from {} to {} for user ID: {}", oldRole, dto.getNewRole(), id);
        
        return userMapper.toResponseDto(savedUser);
    }

    /**
     * Activate user account
     */
    public void activateUser(Long id) {
        log.info("Activating user ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
        
        user.setIsActive(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        log.info("User activated successfully: {}", id);
    }

    /**
     * Deactivate user account
     */
    public void deactivateUser(Long id) {
        log.info("Deactivating user ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
        
        user.setIsActive(false);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        log.info("User deactivated successfully: {}", id);
    }

    /**
     * Reset user password (generates temporary password)
     */
    public String resetUserPassword(Long id) {
        log.info("Resetting password for user ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
        
        String tempPassword = generateTempPassword();
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        log.info("Password reset successfully for user ID: {}", id);
        return tempPassword;
    }

    /**
     * Force password change on next login
     */
    public void forcePasswordChange(Long id) {
        log.info("Forcing password change for user ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
        
        // This would require additional field in User entity
        // For now, we'll just log the action
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        log.info("Password change forced for user ID: {}", id);
    }

    /**
     * Get user permissions
     */
    @Transactional(readOnly = true)
    public UserPermissionsDto getUserPermissions(Long id) {
        log.info("Fetching permissions for user ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
        
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
     * Bulk user operations
     */
    public String bulkUserOperation(BulkUserOperationDto dto) {
        log.info("Performing bulk operation: {} on {} users", dto.getOperation(), dto.getUserIds().size());
        
        List<User> users = userRepository.findAllById(dto.getUserIds());
        if (users.size() != dto.getUserIds().size()) {
            throw new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND);
        }
        
        int successCount = 0;
        
        switch (dto.getOperation()) {
            case "ACTIVATE":
                for (User user : users) {
                    user.setIsActive(true);
                    user.setUpdatedAt(LocalDateTime.now());
                    successCount++;
                }
                break;
                
            case "DEACTIVATE":
                for (User user : users) {
                    user.setIsActive(false);
                    user.setUpdatedAt(LocalDateTime.now());
                    successCount++;
                }
                break;
                
            case "CHANGE_ROLE":
                if (dto.getNewRole() == null) {
                    throw new IllegalArgumentException("New role is required for CHANGE_ROLE operation");
                }
                for (User user : users) {
                    user.setRole(dto.getNewRole());
                    user.setUpdatedAt(LocalDateTime.now());
                    successCount++;
                }
                break;
                
            case "DELETE":
                userRepository.deleteAll(users);
                successCount = users.size();
                break;
                
            case "RESET_PASSWORD":
                for (User user : users) {
                    String tempPassword = generateTempPassword();
                    user.setPasswordHash(passwordEncoder.encode(tempPassword));
                    user.setUpdatedAt(LocalDateTime.now());
                    successCount++;
                }
                break;
                
            default:
                throw new IllegalArgumentException("Invalid operation: " + dto.getOperation());
        }
        
        if (!dto.getOperation().equals("DELETE")) {
            userRepository.saveAll(users);
        }
        
        String result = String.format("Bulk operation %s completed successfully for %d users", 
                dto.getOperation(), successCount);
        log.info(result);
        return result;
    }

    /**
     * Get user statistics
     */
    @Transactional(readOnly = true)
    public UserStatsDto getUserStats() {
        log.info("Fetching user statistics");
        
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActive(true);
        long inactiveUsers = userRepository.countByIsActive(false);
        
        // Users by role
        Map<String, Long> usersByRole = Arrays.stream(UserRole.values())
                .collect(Collectors.toMap(
                        Enum::name,
                        role -> userRepository.countByRole(role)
                ));
        
        // Users by unit
        // Lấy dữ liệu dạng List<Object[]> từ Repository
        List<Object[]> unitStats = userRepository.findUserCountByUnit();

        // Chuyển đổi List<Object[]> thành Map<String, Long> thủ công
        Map<String, Long> usersByUnit = unitStats.stream()
                .collect(Collectors.toMap(
                        // row[0] là unitId (Long), convert sang String. Nếu null thì để "Unknown"
                        row -> row[0] != null ? row[0].toString() : "Unknown",
                        // row[1] là count (Long)
                        row -> (Long) row[1]
                ));
        // Users created this month/week
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfWeek = LocalDateTime.now().minusDays(7);
        
        long usersCreatedThisMonth = userRepository.countByCreatedAtAfter(startOfMonth);
        long usersCreatedThisWeek = userRepository.countByCreatedAtAfter(startOfWeek);
        
        return UserStatsDto.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .usersByRole(usersByRole)
                .usersByUnit(usersByUnit)
                .usersCreatedThisMonth(usersCreatedThisMonth)
                .usersCreatedThisWeek(usersCreatedThisWeek)
                .build();
    }

    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    public List<UserResponseDto> getUsersByRole(UserRole role) {
        log.info("Fetching users by role: {}", role);
        
        List<User> users = userRepository.findByRole(role);
        return users.stream()
                .map(userMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Get inactive users
     */
    @Transactional(readOnly = true)
    public List<UserResponseDto> getInactiveUsers(int daysInactive) {
        log.info("Fetching users inactive for {} days", daysInactive);
        
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysInactive);
        List<User> users = userRepository.findInactiveUsers(cutoffDate);
        
        return users.stream()
                .map(userMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    /**
     * Get users with expiring accounts
     */
    @Transactional(readOnly = true)
    public List<UserResponseDto> getExpiringUsers(int daysUntilExpiry) {
        log.info("Fetching users with accounts expiring in {} days", daysUntilExpiry);
        return new ArrayList<>();
    }

    /**
     * Export users data
     */
    @Transactional(readOnly = true)
    public String exportUsers(UserRole role, Long unitId, Boolean isActive) {
        log.info("Exporting users data");
        
        List<User> users;
        if (role != null || unitId != null || isActive != null) {
            users = userRepository.findByFiltersForExport(role, unitId, isActive);
        } else {
            users = userRepository.findAll();
        }
        
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Username,Full Name,Email,Role,Unit ID,Phone,Active,Created At\n");
        
        for (User user : users) {
            // Sửa lỗi: Lấy Unit ID thông qua object Unit
            Long currentUnitId = (user.getUnit() != null) ? user.getUnit().getId() : null;
            
            csv.append(String.format("%d,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    user.getId(),
                    user.getUsername(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole(),
                    currentUnitId != null ? currentUnitId : "", // Fix here
                    user.getPhoneNumber() != null ? user.getPhoneNumber() : "",
                    user.getIsActive(),
                    user.getCreatedAt()
            ));
        }
        
        return csv.toString();
    }

    /**
     * Get audit log for user changes
     */
    @Transactional(readOnly = true)
    public List<String> getUserAuditLog(Long id) {
        log.info("Fetching audit log for user ID: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
        
        return List.of(
                "User created: " + user.getCreatedAt(),
                "Last updated: " + user.getUpdatedAt(),
                "Current status: " + (Boolean.TRUE.equals(user.getIsActive()) ? "Active" : "Inactive"),
                "Current role: " + user.getRole()
        );
    }

    /**
     * Generate temporary password
     */
    private String generateTempPassword() {
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 12; i++) {
            password.append(TEMP_PASSWORD_CHARS.charAt(random.nextInt(TEMP_PASSWORD_CHARS.length())));
        }
        return password.toString();
    }
}