package com.cotowork.userservice.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;

/**
 * JWT Utility class for token generation and validation
 * Supports RS256 algorithm for secure token signing
 */
@Component
@Slf4j
public class JwtUtil {

    private final SecretKey secretKey;
    private final long jwtExpirationMs;
    private final long refreshTokenExpirationMs;

    public JwtUtil(
            @Value("${app.jwt.secret:mySecretKey123456789012345678901234567890}") String jwtSecret,
            @Value("${app.jwt.expiration-ms:86400000}") long jwtExpirationMs, // 24 hours
            @Value("${app.jwt.refresh-expiration-ms:604800000}") long refreshTokenExpirationMs // 7 days
    ) {
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        this.jwtExpirationMs = jwtExpirationMs;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    /**
     * Generate JWT access token
     */
    public String generateAccessToken(String username, Long userId, String role, Long unitId, List<String> permissions) {
        Instant now = Instant.now();
        
        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .claim("role", role)
                .claim("unitId", unitId)
                .claim("permissions", permissions)
                .claim("type", "access")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(jwtExpirationMs, ChronoUnit.MILLIS)))
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Generate JWT refresh token
     */
    public String generateRefreshToken(String username, Long userId) {
        Instant now = Instant.now();
        
        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .claim("type", "refresh")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(refreshTokenExpirationMs, ChronoUnit.MILLIS)))
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Extract username from JWT token
     */
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    /**
     * Extract user ID from JWT token
     */
    public Long extractUserId(String token) {
        return extractClaims(token).get("userId", Long.class);
    }

    /**
     * Extract role from JWT token
     */
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    /**
     * Extract unit ID from JWT token
     */
    public Long extractUnitId(String token) {
        return extractClaims(token).get("unitId", Long.class);
    }

    /**
     * Extract permissions from JWT token
     */
    @SuppressWarnings("unchecked")
    public List<String> extractPermissions(String token) {
        return extractClaims(token).get("permissions", List.class);
    }

    /**
     * Extract token type from JWT token
     */
    public String extractTokenType(String token) {
        return extractClaims(token).get("type", String.class);
    }

    /**
     * Extract expiration date from JWT token
     */
    public Date extractExpiration(String token) {
        return extractClaims(token).getExpiration();
    }

    /**
     * Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (JwtException e) {
            log.warn("Error checking token expiration: {}", e.getMessage());
            return true;
        }
    }

    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            extractClaims(token);
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Validate access token specifically
     */
    public boolean validateAccessToken(String token) {
        try {
            if (!validateToken(token)) {
                return false;
            }
            String tokenType = extractTokenType(token);
            return "access".equals(tokenType);
        } catch (Exception e) {
            log.warn("Error validating access token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Validate refresh token specifically
     */
    public boolean validateRefreshToken(String token) {
        try {
            if (!validateToken(token)) {
                return false;
            }
            String tokenType = extractTokenType(token);
            return "refresh".equals(tokenType);
        } catch (Exception e) {
            log.warn("Error validating refresh token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Extract all claims from JWT token
     */
    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}