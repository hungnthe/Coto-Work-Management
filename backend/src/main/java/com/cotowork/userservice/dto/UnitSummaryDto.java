package com.cotowork.userservice.dto;

import lombok.*;

/**
 * Lightweight DTO for Unit information (used in UserResponseDto to avoid circular references)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnitSummaryDto {
    
    private Long id;
    private String unitCode;
    private String unitName;
    private Long parentUnitId;
}
