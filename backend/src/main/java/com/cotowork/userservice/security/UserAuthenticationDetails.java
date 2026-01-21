package com.cotowork.userservice.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * User authentication details extracted from JWT token
 * Used to store user information in request context
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAuthenticationDetails {
    
    private Long userId;
    private String username;
    private String role;
    private Long unitId;
    private List<String> permissions;
    
    /**
     * Check if user has a specific permission
     */
    public boolean hasPermission(String permission) {
        return permissions != null && permissions.contains(permission);
    }
    
    /**
     * Check if user has any of the specified permissions
     */
    public boolean hasAnyPermission(String... permissions) {
        if (this.permissions == null) {
            return false;
        }
        
        for (String permission : permissions) {
            if (this.permissions.contains(permission)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check if user has a specific role
     */
    public boolean hasRole(String role) {
        return this.role != null && this.role.equals(role);
    }
}