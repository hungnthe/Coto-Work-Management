package com.cotowork.userservice.dto;

import com.cotowork.userservice.entity.UserRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating existing users
 * Password update is handled separately for security
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateDto {
    
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;
    
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;
    
    private Long unitId;
    
    private UserRole role;
    
    private Boolean isActive;
    
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be 10-15 digits")
    private String phoneNumber;
    
    private String avatarUrl;
    
    // NO PASSWORD FIELD - Password changes handled separately
}
