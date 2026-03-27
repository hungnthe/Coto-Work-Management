package com.cotowork.userservice.dto;

import com.cotowork.userservice.entity.UserRole;
import lombok.*;

import java.util.List;

/**
 * DTO for user permissions information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPermissionsDto {
    
    private Long userId;
    private String username;
    private UserRole role;
    private List<String> permissions;
    private String unitName;
    private Boolean isActive;
}