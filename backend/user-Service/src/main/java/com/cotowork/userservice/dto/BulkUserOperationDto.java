package com.cotowork.userservice.dto;

import com.cotowork.userservice.entity.UserRole;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

/**
 * DTO for bulk user operations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkUserOperationDto {
    
    @NotEmpty(message = "User IDs list cannot be empty")
    private List<Long> userIds;
    
    @NotBlank(message = "Operation is required")
    @Pattern(regexp = "^(ACTIVATE|DEACTIVATE|CHANGE_ROLE|DELETE|RESET_PASSWORD)$", 
             message = "Operation must be one of: ACTIVATE, DEACTIVATE, CHANGE_ROLE, DELETE, RESET_PASSWORD")
    private String operation;
    
    // For CHANGE_ROLE operation
    private UserRole newRole;
    
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}