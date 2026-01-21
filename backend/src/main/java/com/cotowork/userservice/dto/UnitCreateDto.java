package com.cotowork.userservice.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnitCreateDto {
    
    @NotBlank(message = "Unit code is required")
    @Size(max = 50, message = "Unit code must not exceed 50 characters")
    @Pattern(regexp = "^[A-Z0-9_]+$", message = "Unit code must contain only uppercase letters, numbers and underscores")
    private String unitCode;
    
    @NotBlank(message = "Unit name is required")
    @Size(max = 200, message = "Unit name must not exceed 200 characters")
    private String unitName;
    
    private Long parentUnitId; // Nullable for root units
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    @Size(max = 100, message = "Address must not exceed 100 characters")
    private String address;
    
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be 10-15 digits")
    private String phoneNumber;
}
