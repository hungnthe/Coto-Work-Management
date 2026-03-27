package com.cotowork.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for token validation response (used by API Gateway)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenValidationResponseDto {

    private boolean valid;
    private String username;
    private Long userId;
    private String role;
    private Long unitId;
    private List<String> permissions;
    private String errorMessage;
    
    public static TokenValidationResponseDto invalid(String errorMessage) {
        return TokenValidationResponseDto.builder()
                .valid(false)
                .errorMessage(errorMessage)
                .build();
    }
    
    public static TokenValidationResponseDto valid(String username, Long userId, String role, Long unitId, List<String> permissions) {
        return TokenValidationResponseDto.builder()
                .valid(true)
                .username(username)
                .userId(userId)
                .role(role)
                .unitId(unitId)
                .permissions(permissions)
                .build();
    }
}