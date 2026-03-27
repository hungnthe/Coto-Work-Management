package com.cotowork.taskservice.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Tương đương UserAuthenticationDetails của user-service
 * Lưu vào request.setAttribute("userDetails", ...)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JwtUserPrincipal {

    private Long userId;
    private String username;
    private String role;
    private Long unitId;
    private List<String> permissions;

    public boolean hasPermission(String permission) {
        return permissions != null && permissions.contains(permission);
    }

    public boolean hasAnyPermission(String... perms) {
        if (permissions == null) return false;
        for (String p : perms) {
            if (permissions.contains(p)) return true;
        }
        return false;
    }

    public boolean hasRole(String r) {
        return this.role != null && this.role.equals(r);
    }
}