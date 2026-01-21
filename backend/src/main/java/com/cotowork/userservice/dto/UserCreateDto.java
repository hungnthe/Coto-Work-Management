package com.cotowork.userservice.dto;

import com.cotowork.userservice.entity.UserRole;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * DTO for creating new users
 * Password will be hashed before storing
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCreateDto {
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscores")
    private String username;
    
    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$", 
             message = "Password must contain at least one uppercase letter, one lowercase letter, and one number")
    private String password; // Will be hashed with BCrypt before storing
    
    @NotNull(message = "Unit ID is required")
    private Long unitId;
    
    @NotNull(message = "Role is required")
    private UserRole role;
    
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be 10-15 digits")
    private String phoneNumber;
    
    private String avatarUrl;
}
