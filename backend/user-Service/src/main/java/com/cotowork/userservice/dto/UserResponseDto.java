package com.cotowork.userservice.dto;

import lombok.*;

import java.time.LocalDateTime;

import com.cotowork.userservice.entity.UserRole;

/**
 * DTO for User responses - NEVER includes password field
 * This is the ONLY representation of User that should be returned to clients
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private UnitSummaryDto unit;
    private UserRole role;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String phoneNumber;
    private String avatarUrl;
    
    // NO PASSWORD FIELD - Security Rule #1
}
