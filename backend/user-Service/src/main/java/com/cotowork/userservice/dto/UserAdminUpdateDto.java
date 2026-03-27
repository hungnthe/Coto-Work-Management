package com.cotowork.userservice.dto;

import com.cotowork.userservice.entity.UserRole;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * DTO for admin updating users with full control
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAdminUpdateDto {
    
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;
    
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;
    
    private Long unitId;
    
    private UserRole role;
    
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be 10-15 digits")
    private String phoneNumber;
    
    private String avatarUrl;
    
    // Admin can activate/deactivate accounts
    private Boolean isActive;
    
    // Admin can force password change
    private Boolean forcePasswordChange;
    
    // Account expiration date (optional)
    private String accountExpiryDate; // ISO date string
    
    // Additional notes for admin
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String adminNotes;
}