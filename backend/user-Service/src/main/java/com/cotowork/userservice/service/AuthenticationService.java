package com.cotowork.userservice.service;

import com.cotowork.userservice.dto.*;
import com.cotowork.userservice.entity.User;
import com.cotowork.userservice.exception.ErrorCode;
import com.cotowork.userservice.repository.UserRepository;
import com.cotowork.userservice.security.JwtUtil;
import com.cotowork.userservice.security.RolePermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RolePermissionService rolePermissionService;

    /**
     * Authenticate user and generate JWT tokens
     */
    @Transactional
    public LoginResponseDto login(LoginRequestDto loginRequest) {
        log.info("Attempting login for username: {}", loginRequest.getUsername());
        
        // Find user by username
        User user = userRepository.findByUsernameAndIsActiveTrue(loginRequest.getUsername())
                .orElseThrow(() -> {
                    log.warn("Login failed - user not found: {}", loginRequest.getUsername());
                    return new BadCredentialsException(ErrorCode.INVALID_CREDENTIALS.getMessage());
                });

        // Verify password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            log.warn("Login failed - invalid password for user: {}", loginRequest.getUsername());
            throw new BadCredentialsException(ErrorCode.INVALID_CREDENTIALS.getMessage());
        }

        // Check if user is active
        if (!user.getIsActive()) {
            log.warn("Login failed - user is inactive: {}", loginRequest.getUsername());
            throw new BadCredentialsException("User account is inactive");
        }

        // Get user permissions based on role
        List<String> permissions = rolePermissionService.getPermissionsForRole(user.getRole());

        // Generate tokens
        String accessToken = jwtUtil.generateAccessToken(
                user.getUsername(),
                user.getId(),
                user.getRole().name(),
                user.getUnit().getId(),
                permissions
        );

        String refreshToken = jwtUtil.generateRefreshToken(
                user.getUsername(),
                user.getId()
        );

        log.info("Login successful for user: {} with role: {}", user.getUsername(), user.getRole());

        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400L) // 24 hours in seconds
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .unitId(user.getUnit().getId())
                .unitName(user.getUnit().getUnitName()) // Get unitName from Unit entity
                .permissions(permissions)
                .build();
    }

    /**
     * Refresh access token using refresh token
     */
    @Transactional
    public LoginResponseDto refreshToken(RefreshTokenRequestDto refreshRequest) {
        log.info("Attempting token refresh");
        
        String refreshToken = refreshRequest.getRefreshToken();
        
        // Validate refresh token
        if (!jwtUtil.validateRefreshToken(refreshToken)) {
            log.warn("Token refresh failed - invalid refresh token");
            throw new BadCredentialsException(ErrorCode.TOKEN_INVALID.getMessage());
        }

        // Extract user information from refresh token
        String username = jwtUtil.extractUsername(refreshToken);
        Long userId = jwtUtil.extractUserId(refreshToken);

        // Find user to get current information
        User user = userRepository.findById(userId)
                .filter(User::getIsActive) // Thay thế findByIdAndIsActiveTrue nếu chưa có
                .orElseThrow(() -> {
                    log.warn("Token refresh failed - user not found or inactive: {}", userId);
                    return new BadCredentialsException("User not found or inactive");
                });

        // Verify username matches
        if (!user.getUsername().equals(username)) {
            log.warn("Token refresh failed - username mismatch for user: {}", userId);
            throw new BadCredentialsException(ErrorCode.TOKEN_INVALID.getMessage());
        }

        // Get current user permissions
        List<String> permissions = rolePermissionService.getPermissionsForRole(user.getRole());

        // Generate new access token
        String newAccessToken = jwtUtil.generateAccessToken(
                user.getUsername(),
                user.getId(),
                user.getRole().name(),
                user.getUnit().getId(),
                permissions
        );

        log.info("Token refresh successful for user: {}", user.getUsername());

        return LoginResponseDto.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken) // Keep the same refresh token
                .tokenType("Bearer")
                .expiresIn(86400L)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .unitId(user.getUnit().getId())
                .unitName(user.getUnit().getUnitName())
                .permissions(permissions)
                .build();
    }

    /**
     * Validate token for API Gateway
     */
    public TokenValidationResponseDto validateToken(TokenValidationRequestDto validationRequest) {
        String token = validationRequest.getToken();
        
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            if (!jwtUtil.validateAccessToken(token)) {
                return TokenValidationResponseDto.invalid("Invalid or expired token");
            }

            String username = jwtUtil.extractUsername(token);
            Long userId = jwtUtil.extractUserId(token);
            String role = jwtUtil.extractRole(token);
            Long unitId = jwtUtil.extractUnitId(token);
            List<String> permissions = jwtUtil.extractPermissions(token);

            // Verify user exists and is active
            // Sử dụng existsById thay vì existsByIdAndIsActiveTrue để tránh lỗi nếu chưa khai báo hàm
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || !user.getIsActive()) {
                 log.warn("Token validation failed - user not found or inactive: {}", userId);
                 return TokenValidationResponseDto.invalid("User not found or inactive");
            }

            log.debug("Token validation successful for user: {}", username);
            return TokenValidationResponseDto.valid(username, userId, role, unitId, permissions);

        } catch (Exception e) {
            log.warn("Token validation failed: {}", e.getMessage());
            return TokenValidationResponseDto.invalid("Token validation failed: " + e.getMessage());
        }
    }

    public void logout(String token) {
        log.info("Logout requested");
    }

    public boolean testDatabaseConnection() {
        try {
            return userRepository.existsByUsername("admin");
        } catch (Exception e) {
            log.error("Database test failed: ", e);
            throw e;
        }
    }
}