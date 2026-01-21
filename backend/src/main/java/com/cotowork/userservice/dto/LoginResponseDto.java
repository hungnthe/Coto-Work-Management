package com.cotowork.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for login response containing JWT tokens and user info
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {

    private String accessToken;
    private String refreshToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private Long expiresIn; // in seconds
    
    // User information
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private Long unitId;
    private String unitName;
    private List<String> permissions;
}