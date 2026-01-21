package com.cotowork.userservice.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.Optional;

/**
 * Security utility class for accessing current user information
 */
public class SecurityUtils {

    /**
     * Get current authenticated username
     */
    public static Optional<String> getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            return Optional.of(authentication.getName());
        }
        return Optional.empty();
    }

    /**
     * Get current user details from request attributes
     */
    public static Optional<UserAuthenticationDetails> getCurrentUserDetails() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            UserAuthenticationDetails userDetails = (UserAuthenticationDetails) request.getAttribute("userDetails");
            return Optional.ofNullable(userDetails);
        }
        return Optional.empty();
    }

    /**
     * Get current user ID
     */
    public static Optional<Long> getCurrentUserId() {
        return getCurrentUserDetails().map(UserAuthenticationDetails::getUserId);
    }

    /**
     * Get current user role
     */
    public static Optional<String> getCurrentUserRole() {
        return getCurrentUserDetails().map(UserAuthenticationDetails::getRole);
    }

    /**
     * Get current user unit ID
     */
    public static Optional<Long> getCurrentUserUnitId() {
        return getCurrentUserDetails().map(UserAuthenticationDetails::getUnitId);
    }

    /**
     * Get current user permissions
     */
    public static Optional<List<String>> getCurrentUserPermissions() {
        return getCurrentUserDetails().map(UserAuthenticationDetails::getPermissions);
    }

    /**
     * Check if current user has a specific permission
     */
    public static boolean hasPermission(String permission) {
        return getCurrentUserDetails()
                .map(details -> details.hasPermission(permission))
                .orElse(false);
    }

    /**
     * Check if current user has any of the specified permissions
     */
    public static boolean hasAnyPermission(String... permissions) {
        return getCurrentUserDetails()
                .map(details -> details.hasAnyPermission(permissions))
                .orElse(false);
    }

    /**
     * Check if current user has a specific role
     */
    public static boolean hasRole(String role) {
        return getCurrentUserDetails()
                .map(details -> details.hasRole(role))
                .orElse(false);
    }

    /**
     * Check if current user is admin
     */
    public static boolean isAdmin() {
        return hasRole("ADMIN");
    }

    /**
     * Check if current user is unit manager
     */
    public static boolean isUnitManager() {
        return hasRole("UNIT_MANAGER");
    }

    /**
     * Check if current user can access resource belonging to specific unit
     * Admin can access all units, Unit Manager can access their own unit, Staff can access their own unit
     */
    public static boolean canAccessUnit(Long unitId) {
        if (isAdmin()) {
            return true; // Admin can access all units
        }
        
        return getCurrentUserUnitId()
                .map(currentUnitId -> currentUnitId.equals(unitId))
                .orElse(false);
    }

    /**
     * Check if current user can access resource belonging to specific user
     * Admin can access all users, Unit Manager can access users in their unit, Staff can access their own profile
     */
    public static boolean canAccessUser(Long userId, Long userUnitId) {
        if (isAdmin()) {
            return true; // Admin can access all users
        }
        
        // Check if it's the current user's own profile
        Optional<Long> currentUserId = getCurrentUserId();
        if (currentUserId.isPresent() && currentUserId.get().equals(userId)) {
            return true;
        }
        
        // Check if user is in the same unit (for Unit Manager)
        if (isUnitManager()) {
            return canAccessUnit(userUnitId);
        }
        
        return false;
    }
}