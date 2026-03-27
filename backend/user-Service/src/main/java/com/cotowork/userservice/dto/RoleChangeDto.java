package com.cotowork.userservice.dto;

import com.cotowork.userservice.entity.UserRole;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * DTO for changing user role
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleChangeDto {
    
    @NotNull(message = "New role is required")
    private UserRole newRole;
    
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
    
    // Effective date for role change (optional, defaults to now)
    private String effectiveDate; // ISO date string
}