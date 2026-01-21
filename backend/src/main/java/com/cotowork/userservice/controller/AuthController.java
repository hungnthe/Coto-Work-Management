package com.cotowork.userservice.controller;

import com.cotowork.userservice.dto.*;
import com.cotowork.userservice.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * Handles login, token refresh, and token validation for API Gateway
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationService authenticationService;

    /**
     * User login endpoint
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto loginRequest) {
        log.info("Login request received for username: {}", loginRequest.getUsername());
        
        LoginResponseDto response = authenticationService.login(loginRequest);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Token refresh endpoint
     * POST /api/auth/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponseDto> refreshToken(@Valid @RequestBody RefreshTokenRequestDto refreshRequest) {
        log.info("Token refresh request received");
        
        LoginResponseDto response = authenticationService.refreshToken(refreshRequest);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Token validation endpoint for API Gateway
     * POST /api/auth/validate
     * This endpoint is called by API Gateway to validate incoming requests
     */
    @PostMapping("/validate")
    public ResponseEntity<TokenValidationResponseDto> validateToken(@Valid @RequestBody TokenValidationRequestDto validationRequest) {
        log.debug("Token validation request received");
        
        TokenValidationResponseDto response = authenticationService.validateToken(validationRequest);
        
        if (response.isValid()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(response);
        }
    }

    /**
     * Alternative token validation endpoint using Authorization header
     * GET /api/auth/validate
     * This endpoint can be used by API Gateway with Authorization header
     */
    @GetMapping("/validate")
    public ResponseEntity<TokenValidationResponseDto> validateTokenFromHeader(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        
        if (authorizationHeader == null || authorizationHeader.trim().isEmpty()) {
            log.debug("Token validation failed - no Authorization header");
            return ResponseEntity.status(401)
                    .body(TokenValidationResponseDto.invalid("No Authorization header provided"));
        }

        TokenValidationRequestDto validationRequest = TokenValidationRequestDto.builder()
                .token(authorizationHeader)
                .build();

        TokenValidationResponseDto response = authenticationService.validateToken(validationRequest);
        
        if (response.isValid()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(response);
        }
    }

    /**
     * Logout endpoint
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        log.info("Logout request received");
        
        if (authorizationHeader != null && !authorizationHeader.trim().isEmpty()) {
            authenticationService.logout(authorizationHeader);
        }
        
        return ResponseEntity.ok().build();
    }

    /**
     * Health check endpoint for authentication service
     * GET /api/auth/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Authentication service is healthy");
    }

    /**
     * Test endpoint to check database connection
     * GET /api/auth/test
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        try {
            // Simple test to check if we can find admin user
            boolean userExists = authenticationService.testDatabaseConnection();
            if (userExists) {
                return ResponseEntity.ok("Database connection OK - Admin user found");
            } else {
                return ResponseEntity.ok("Database connection OK - Admin user not found");
            }
        } catch (Exception e) {
            log.error("Test endpoint error: ", e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}