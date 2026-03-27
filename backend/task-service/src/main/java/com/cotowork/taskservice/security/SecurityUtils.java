package com.cotowork.taskservice.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Optional;

/**
 * Security utility - GIỐNG pattern user-service SecurityUtils
 * Lấy userDetails từ request attribute (set bởi JwtAuthenticationFilter)
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    /**
     * Lấy username từ SecurityContext (giống user-service)
     */
    public static Optional<String> getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            return Optional.of(auth.getName());
        }
        return Optional.empty();
    }

    /**
     * Lấy JwtUserPrincipal từ request attribute (giống user-service getCurrentUserDetails)
     */
    public static Optional<JwtUserPrincipal> getCurrentPrincipal() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            HttpServletRequest request = attrs.getRequest();
            JwtUserPrincipal principal = (JwtUserPrincipal) request.getAttribute("userDetails");
            return Optional.ofNullable(principal);
        }
        return Optional.empty();
    }

    public static Optional<Long> getCurrentUserId() {
        return getCurrentPrincipal().map(JwtUserPrincipal::getUserId);
    }

    public static Optional<String> getCurrentRole() {
        return getCurrentPrincipal().map(JwtUserPrincipal::getRole);
    }

    public static Optional<Long> getCurrentUnitId() {
        return getCurrentPrincipal().map(JwtUserPrincipal::getUnitId);
    }

    public static boolean hasPermission(String permission) {
        return getCurrentPrincipal()
                .map(p -> p.hasPermission(permission))
                .orElse(false);
    }

    public static boolean hasRole(String role) {
        return getCurrentPrincipal()
                .map(p -> p.hasRole(role))
                .orElse(false);
    }

    public static boolean isAdmin() {
        return hasRole("ADMIN");
    }
}