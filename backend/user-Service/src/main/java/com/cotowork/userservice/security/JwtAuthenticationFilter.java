package com.cotowork.userservice.security;

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
import java.util.List;

/**
 * JWT Authentication Filter
 * Intercepts requests and validates JWT tokens
 * Sets up Spring Security context with user information
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;


    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Skip authentication for public endpoints
        String requestPath = request.getRequestURI();
        if (isPublicEndpoint(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract JWT token from Authorization header
        String authorizationHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            token = authorizationHeader.substring(7);
            
            // Debug check for common Postman mistake
            if (token.contains("{{") || token.equals("null")) {
                log.warn("SUSPICIOUS TOKEN DETECTED: Token looks like an unresolved Postman variable or null string. Token: {}", token);
            }
            
            try {
                username = jwtUtil.extractUsername(token);
            } catch (Exception e) {
                log.warn("Error extracting username from JWT token: {}. Token part: {}", e.getMessage(), token.length() > 10 ? token.substring(0, 10) + "..." : token);
            }
        } else {
            if (authorizationHeader == null) {
                log.debug("No Authorization header found for request: {}", requestPath);
            } else {
                log.warn("Invalid Authorization header format: {}", authorizationHeader);
            }
        }

        // Validate token and set up security context
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateAccessToken(token)) {
                try {
                    // 1. Extract thông tin (An toàn với Null)
                    Long userId = jwtUtil.extractUserId(token);
                    String role = jwtUtil.extractRole(token);
                    Long unitId = jwtUtil.extractUnitId(token);
                    List<String> permissions = jwtUtil.extractPermissions(token);

                    // 2. Xử lý trường hợp permissions bị null (Khởi tạo list rỗng để tránh lỗi)
                    if (permissions == null) {
                        permissions = new java.util.ArrayList<>();
                    }

                    // 3. Tạo danh sách Authorities (Dùng ArrayList để có thể sửa đổi/add thêm sau này)
                    List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();

                    // Add permissions vào authorities
                    for (String permission : permissions) {
                        authorities.add(new SimpleGrantedAuthority(permission));
                    }

                    // 4. Add Role (Kiểm tra null trước khi add)
                    if (role != null && !role.isEmpty()) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                    }

                    // 5. Tạo Authentication Token
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username, null, authorities);

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // 6. Build User Details
                    UserAuthenticationDetails userDetails = UserAuthenticationDetails.builder()
                            .userId(userId)
                            .username(username)
                            .role(role)
                            .unitId(unitId)
                            .permissions(permissions)
                            .build();

                    request.setAttribute("userDetails", userDetails);

                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    log.debug("JWT authentication successful for user: {}", username);

                } catch (Exception e) {
                    // Sửa log để hiện đầy đủ lỗi (stack trace) thay vì chỉ hiện "null"
                    log.error("Error setting up security context for user {}: ", username, e);
                }
            } else {
                log.warn("Invalid JWT token for user: {}", username);
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Check if the endpoint is public (doesn't require authentication)
     */
    private boolean isPublicEndpoint(String requestPath) {
        return requestPath.startsWith("/api/auth/") ||
                requestPath.startsWith("/actuator/") ||
                requestPath.equals("/api/auth/health") ||
                // THÊM 2 DÒNG NÀY:
                requestPath.startsWith("/swagger-ui") ||
                requestPath.startsWith("/v3/api-docs");
    }


}