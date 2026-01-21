package com.cotowork.userservice.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO for Unit responses
 * Note: Users list is not included to avoid circular references and N+1 queries
 * Use GET /api/users/unit/{unitId} to get users of a specific unit
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnitResponseDto {
    
    private Long id;
    private String unitCode;
    private String unitName;
    private Long parentUnitId;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String address;
    private String phoneNumber;
    // Users list removed to avoid circular reference and performance issues
}
