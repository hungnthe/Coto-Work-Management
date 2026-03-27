package com.cotowork.taskservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * JWT Authentication Filter
 * Copy pattern từ user-service JwtAuthenticationFilter
 * Đọc token → validate → set SecurityContext + request attribute
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Bỏ qua check JWT token cho đường dẫn WebSocket
        return path.startsWith("/ws/");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Skip public endpoints
        String requestPath = request.getRequestURI();
        if (isPublicEndpoint(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract token
        String authorizationHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            token = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(token);
            } catch (Exception e) {
                log.warn("Error extracting username from JWT: {}", e.getMessage());
            }
        }

        // Validate token and set security context
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(token)) {
                try {
                    Long userId = jwtUtil.extractUserId(token);
                    String role = jwtUtil.extractRole(token);
                    Long unitId = jwtUtil.extractUnitId(token);
                    List<String> permissions = jwtUtil.extractPermissions(token);

                    if (permissions == null) {
                        permissions = new ArrayList<>();
                    }

                    // Tạo authorities (giống user-service)
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    for (String permission : permissions) {
                        authorities.add(new SimpleGrantedAuthority(permission));
                    }
                    if (role != null && !role.isEmpty()) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                    }

                    // Set Authentication (giống user-service: principal = username string)
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(username, null, authorities);
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    // Lưu user details vào request attribute (giống user-service)
                    JwtUserPrincipal userDetails = JwtUserPrincipal.builder()
                            .userId(userId)
                            .username(username)
                            .role(role)
                            .unitId(unitId)
                            .permissions(permissions)
                            .build();
                    request.setAttribute("userDetails", userDetails);

                    log.debug("JWT authenticated: user={}, role={}, permissions={}",
                            username, role, permissions.size());

                } catch (Exception e) {
                    log.error("Error setting security context for user {}: ", username, e);
                }
            } else {
                log.warn("Invalid JWT token for user: {}", username);
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String requestPath) {
        return requestPath.equals("/api/tasks/health") ||
                requestPath.startsWith("/actuator/") ||
                requestPath.startsWith("/swagger-ui") ||
                requestPath.startsWith("/v3/api-docs") ||
                requestPath.startsWith("/api-docs");
    }
}