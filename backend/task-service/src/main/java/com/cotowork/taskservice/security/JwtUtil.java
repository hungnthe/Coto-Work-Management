package com.cotowork.taskservice.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;

/**
 * JWT Utility - Chỉ VALIDATE token (không tạo token)
 * Token được tạo bởi user-service, task-service chỉ cần đọc và xác thực
 *
 * QUAN TRỌNG: Phải dùng CÙNG cách tạo SecretKey với user-service
 * user-service dùng: Keys.hmacShaKeyFor(jwtSecret.getBytes())
 * → task-service PHẢI dùng y hệt
 */
@Component
@Slf4j
public class JwtUtil {

    private final SecretKey secretKey;

    public JwtUtil(
            // ★ PHẢI CÙNG property name + default value với user-service
            @Value("${app.jwt.secret:mySecretKey123456789012345678901234567890}") String jwtSecret
    ) {
        // ★ PHẢI dùng .getBytes() giống user-service (KHÔNG dùng Base64 decode)
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        log.info("JwtUtil initialized with secret key (first 10 chars): {}...",
                jwtSecret.substring(0, Math.min(10, jwtSecret.length())));
    }

    /**
     * Validate token - giống user-service validateAccessToken()
     */
    public boolean validateToken(String token) {
        try {
            Claims claims = extractClaims(token);
            // Check expiration
            if (claims.getExpiration().before(new Date())) {
                log.warn("JWT token expired");
                return false;
            }
            // Check token type = access (giống user-service)
            String tokenType = claims.get("type", String.class);
            if (!"access".equals(tokenType)) {
                log.warn("JWT token is not access type: {}", tokenType);
                return false;
            }
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return extractClaims(token).get("userId", Long.class);
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public Long extractUnitId(String token) {
        return extractClaims(token).get("unitId", Long.class);
    }

    @SuppressWarnings("unchecked")
    public List<String> extractPermissions(String token) {
        return extractClaims(token).get("permissions", List.class);
    }

    /**
     * Parse token - CÙNG cách với user-service
     */
    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}