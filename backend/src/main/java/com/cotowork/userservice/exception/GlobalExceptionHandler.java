package com.cotowork.userservice.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Global Exception Handler cho toàn bộ ứng dụng.
 * Sử dụng @RestControllerAdvice để bắt và xử lý tất cả các exceptions một cách tập trung.
 * 
 * Cung cấp:
 * - Structured logging với request context
 * - Standard error response format
 * - Security-aware error handling (không leak sensitive information)
 * - Comprehensive exception coverage
 * 
 * Requirements: 3.1, 3.2, 3.3 - Global exception handling với logging configuration
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    /**
     * Tạo structured log entry với request context
     * 
     * @param level Log level (ERROR, WARN, INFO)
     * @param message Log message
     * @param exception Exception instance
     * @param request HTTP request
     */
    private void logWithContext(String level, String message, Exception exception, HttpServletRequest request) {
        String requestId = extractRequestId(request);
        String userAgent = request.getHeader("User-Agent");
        String remoteAddr = getClientIpAddress(request);
        
        Map<String, Object> logContext = new HashMap<>();
        logContext.put("requestId", requestId);
        logContext.put("method", request.getMethod());
        logContext.put("uri", request.getRequestURI());
        logContext.put("remoteAddr", remoteAddr);
        logContext.put("userAgent", userAgent);
        logContext.put("timestamp", LocalDateTime.now());
        
        if (exception != null) {
            logContext.put("exceptionType", exception.getClass().getSimpleName());
            logContext.put("exceptionMessage", sanitizeMessage(exception.getMessage()));
        }
        
        String logMessage = String.format("%s - Context: %s", message, logContext);
        
        switch (level.toUpperCase()) {
            case "ERROR":
                if (exception != null) {
                    log.error(logMessage, exception);
                } else {
                    log.error(logMessage);
                }
                break;
            case "WARN":
                log.warn(logMessage);
                break;
            case "INFO":
                log.info(logMessage);
                break;
            default:
                log.debug(logMessage);
        }
    }
    
    /**
     * Sanitize error message để loại bỏ sensitive information
     * 
     * @param message Original message
     * @return Sanitized message
     */
    private String sanitizeMessage(String message) {
        if (message == null) {
            return null;
        }
        
        // Remove potential sensitive information patterns
        return message
                .replaceAll("(?i)password[=:]\\s*\\S+", "password=***")
                .replaceAll("(?i)token[=:]\\s*\\S+", "token=***")
                .replaceAll("(?i)secret[=:]\\s*\\S+", "secret=***")
                .replaceAll("(?i)key[=:]\\s*\\S+", "key=***");
    }
    
    /**
     * Extract request ID từ header hoặc tạo mới
     * 
     * @param request HTTP request
     * @return Request ID
     */
    private String extractRequestId(HttpServletRequest request) {
        String requestId = request.getHeader("X-Request-ID");
        if (requestId == null || requestId.trim().isEmpty()) {
            requestId = java.util.UUID.randomUUID().toString().substring(0, 8);
        }
        return requestId;
    }
    
    /**
     * Lấy client IP address từ request
     * 
     * @param request HTTP request
     * @return Client IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    /**
     * Tạo ErrorResponse với enhanced context information
     * 
     * @param errorCode Error code
     * @param message Custom message (optional)
     * @param request HTTP request
     * @param additionalDetails Additional details (optional)
     * @return Enhanced ErrorResponse
     */
    private ErrorResponse buildErrorResponse(ErrorCode errorCode, String message, HttpServletRequest request, Map<String, Object> additionalDetails) {
        String finalMessage = (message != null && !message.trim().isEmpty()) ? message : errorCode.getMessage();
        
        ErrorResponse.ErrorResponseBuilder builder = ErrorResponse.builder()
                .errorCode(errorCode.getCode())
                .errorMessage(finalMessage)
                .timestamp(LocalDateTime.now())
                .httpStatus(errorCode.getHttpStatusValue())
                .path(request.getRequestURI());
        
        // Add request context details (non-sensitive)
        Map<String, Object> contextDetails = new HashMap<>();
        contextDetails.put("method", request.getMethod());
        contextDetails.put("requestId", extractRequestId(request));
        
        if (additionalDetails != null && !additionalDetails.isEmpty()) {
            contextDetails.putAll(additionalDetails);
        }
        
        builder.details(contextDetails);
        return builder.build();
    }
    
    /**
     * Tạo ErrorResponse từ BusinessException
     * 
     * @param exception BusinessException
     * @param request HTTP request
     * @return ErrorResponse
     */
    private ErrorResponse buildErrorResponse(BusinessException exception, HttpServletRequest request) {
        Map<String, Object> contextDetails = new HashMap<>();
        contextDetails.put("method", request.getMethod());
        contextDetails.put("requestId", extractRequestId(request));
        
        // Merge exception details với context details
        if (exception.getDetails() != null && !exception.getDetails().isEmpty()) {
            contextDetails.putAll(exception.getDetails());
        }
        
        return ErrorResponse.builder()
                .errorCode(exception.getErrorCode().getCode())
                .errorMessage(exception.getMessage())
                .timestamp(LocalDateTime.now())
                .httpStatus(exception.getErrorCode().getHttpStatusValue())
                .path(request.getRequestURI())
                .details(contextDetails)
                .build();
    }
    
    // ==================== BUSINESS EXCEPTION HANDLERS ====================
    
    
    /**
     * Handle BusinessException - Base exception cho tất cả business logic errors
     * Requirements: 3.1, 3.2 - Global exception handling với logging
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex, HttpServletRequest request) {
        logWithContext("ERROR", "Business exception occurred", ex, request);
        ErrorResponse error = buildErrorResponse(ex, request);
        return ResponseEntity.status(ex.getErrorCode().getHttpStatus()).body(error);
    }
    
    /**
     * Handle AuthenticationException - Lỗi xác thực
     * Requirements: 3.4, 5.3, 5.4 - Authentication error handling với JSON response
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException ex, HttpServletRequest request) {
        logWithContext("WARN", "Authentication failed", ex, request);
        ErrorResponse error = buildErrorResponse(ex, request);
        return ResponseEntity.status(ex.getErrorCode().getHttpStatus()).body(error);
    }
    
    /**
     * Handle AuthorizationException - Lỗi phân quyền
     * Requirements: 3.5, 5.3, 5.4 - Authorization error handling với JSON response
     */
    @ExceptionHandler(AuthorizationException.class)
    public ResponseEntity<ErrorResponse> handleAuthorizationException(AuthorizationException ex, HttpServletRequest request) {
        logWithContext("WARN", "Authorization failed", ex, request);
        ErrorResponse error = buildErrorResponse(ex, request);
        return ResponseEntity.status(ex.getErrorCode().getHttpStatus()).body(error);
    }
    
    /**
     * Handle ValidationException - Lỗi validation với field-level details
     * Requirements: 3.6, 6.1, 6.2, 6.3 - Validation error handling với detailed information
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(ValidationException ex, HttpServletRequest request) {
        logWithContext("ERROR", "Validation failed", ex, request);
        
        ErrorResponse error = buildErrorResponse(ex, request);
        
        // Add field-level validation errors nếu có
        if (ex.hasFieldErrors()) {
            List<Map<String, Object>> fieldErrors = new ArrayList<>();
            for (ValidationException.FieldError fieldError : ex.getFieldErrors()) {
                Map<String, Object> errorDetail = new HashMap<>();
                errorDetail.put("field", fieldError.getField());
                errorDetail.put("rejectedValue", fieldError.getRejectedValue());
                errorDetail.put("message", fieldError.getMessage());
                fieldErrors.add(errorDetail);
            }
            error.addDetail("fieldErrors", fieldErrors);
        }
        
        return ResponseEntity.status(ex.getErrorCode().getHttpStatus()).body(error);
    }
    
    /**
     * Handle ResourceNotFoundException - Lỗi không tìm thấy resource
     * Requirements: 3.7 - Resource not found error handling
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex, HttpServletRequest request) {
        logWithContext("ERROR", "Resource not found", ex, request);
        ErrorResponse error = buildErrorResponse(ex, request);
        return ResponseEntity.status(ex.getErrorCode().getHttpStatus()).body(error);
    }
    
    /**
     * Handle DuplicateDataException - Lỗi dữ liệu trùng lặp
     * Requirements: 3.11 - Duplicate data error handling
     */
    @ExceptionHandler(DuplicateDataException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateDataException(DuplicateDataException ex, HttpServletRequest request) {
        logWithContext("ERROR", "Duplicate data detected", ex, request);
        ErrorResponse error = buildErrorResponse(ex, request);
        return ResponseEntity.status(ex.getErrorCode().getHttpStatus()).body(error);
    }
    
    /**
     * Handle DuplicateResourceException - Deprecated, use DuplicateDataException instead
     */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResourceException(DuplicateResourceException ex, HttpServletRequest request) {
        logWithContext("ERROR", "Duplicate resource (deprecated)", ex, request);
        ErrorResponse error = buildErrorResponse(ex, request);
        return ResponseEntity.status(ex.getErrorCode().getHttpStatus()).body(error);
    }
    
    // ==================== SPRING FRAMEWORK EXCEPTION HANDLERS ====================
    
    
    /**
     * Handle MethodArgumentNotValidException - Spring validation errors
     * Requirements: 6.1, 6.2, 6.3 - Bean validation error handling với detailed field information
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        logWithContext("ERROR", "Method argument validation failed", ex, request);
        
        // Collect field-level validation errors
        List<ValidationErrorDetail> validationErrors = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            ValidationErrorDetail errorDetail = ValidationErrorDetail.builder()
                    .field(fieldError.getField())
                    .rejectedValue(fieldError.getRejectedValue())
                    .message(fieldError.getDefaultMessage())
                    .build();
            validationErrors.add(errorDetail);
        }
        
        Map<String, Object> details = new HashMap<>();
        details.put("validationErrors", validationErrors);
        details.put("errorCount", validationErrors.size());
        
        ErrorResponse error = buildErrorResponse(ErrorCode.VALIDATION_FAILED, null, request, details);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    /**
     * Handle ConstraintViolationException - JPA/Bean validation constraint violations
     * Requirements: 6.1, 6.2, 6.3 - Constraint validation error handling
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(ConstraintViolationException ex, HttpServletRequest request) {
        logWithContext("ERROR", "Constraint validation failed", ex, request);
        
        // Collect constraint violation details
        List<ValidationErrorDetail> validationErrors = new ArrayList<>();
        Set<ConstraintViolation<?>> violations = ex.getConstraintViolations();
        
        for (ConstraintViolation<?> violation : violations) {
            String fieldName = violation.getPropertyPath().toString();
            ValidationErrorDetail errorDetail = ValidationErrorDetail.builder()
                    .field(fieldName)
                    .rejectedValue(violation.getInvalidValue())
                    .message(violation.getMessage())
                    .build();
            validationErrors.add(errorDetail);
        }
        
        Map<String, Object> details = new HashMap<>();
        details.put("validationErrors", validationErrors);
        details.put("errorCount", validationErrors.size());
        
        ErrorResponse error = buildErrorResponse(ErrorCode.VALIDATION_FAILED, null, request, details);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    /**
     * Handle IllegalArgumentException - Invalid method arguments
     * Requirements: 3.6 - Validation error handling
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex, HttpServletRequest request) {
        logWithContext("ERROR", "Illegal argument provided", ex, request);
        ErrorResponse error = buildErrorResponse(ErrorCode.VALIDATION_FAILED, ex.getMessage(), request, null);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    // ==================== SECURITY EXCEPTION HANDLERS ====================
    
    /**
     * Handle BadCredentialsException - Spring Security authentication failures
     * Requirements: 5.1, 5.3, 5.4 - Authentication error handling với JSON response
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentialsException(BadCredentialsException ex, HttpServletRequest request) {
        logWithContext("WARN", "Bad credentials provided", ex, request);
        ErrorResponse error = buildErrorResponse(ErrorCode.INVALID_CREDENTIALS, null, request, null);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
    
    /**
     * Handle AccessDeniedException - Spring Security authorization failures
     * Requirements: 5.2, 5.3, 5.4 - Authorization error handling với JSON response
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest request) {
        logWithContext("WARN", "Access denied", ex, request);
        ErrorResponse error = buildErrorResponse(ErrorCode.ACCESS_DENIED, null, request, null);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }
    
    // ==================== GENERIC EXCEPTION HANDLER ====================
    
    /**
     * Handle Exception - Catch-all cho tất cả unhandled exceptions
     * Requirements: 3.8 - Internal server error handling
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        logWithContext("ERROR", "Unexpected error occurred", ex, request);
        
        Map<String, Object> details = new HashMap<>();
        details.put("exceptionType", ex.getClass().getSimpleName());
        // Không include stack trace trong response để tránh information leakage
        
        ErrorResponse error = buildErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR, null, request, details);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
