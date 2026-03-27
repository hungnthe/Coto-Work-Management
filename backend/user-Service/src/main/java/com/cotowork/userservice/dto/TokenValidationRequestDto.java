package com.cotowork.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for token validation request (used by API Gateway)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenValidationRequestDto {

    @NotBlank(message = "Token is required")
    private String token;
}