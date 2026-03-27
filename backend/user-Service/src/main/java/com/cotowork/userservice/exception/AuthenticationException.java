package com.cotowork.userservice.exception;

import java.util.Map;

/**
 * Exception class cho các lỗi xác thực (authentication).
 * Được sử dụng khi người dùng không thể xác thực danh tính (login thất bại, token không hợp lệ, etc.)
 * 
 * Extends BusinessException để tận dụng cấu trúc chuẩn hóa với ErrorCode và details map.
 */
public class AuthenticationException extends BusinessException {
    
    /**
     * Constructor với ErrorCode
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum (thường là các AUTH_* codes)
     */
    public AuthenticationException(ErrorCode errorCode) {
        super(errorCode);
    }
    
    /**
     * Constructor với ErrorCode và custom message
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     */
    public AuthenticationException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
    
    /**
     * Constructor với ErrorCode và cause
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param cause Exception gốc gây ra lỗi xác thực
     */
    public AuthenticationException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }
    
    /**
     * Constructor với ErrorCode, custom message và cause
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     * @param cause Exception gốc gây ra lỗi xác thực
     */
    public AuthenticationException(ErrorCode errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
    
    /**
     * Constructor với ErrorCode và details map
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param details Map chứa thông tin chi tiết về lỗi xác thực (username, timestamp, etc.)
     */
    public AuthenticationException(ErrorCode errorCode, Map<String, Object> details) {
        super(errorCode, details);
    }
    
    /**
     * Constructor đầy đủ với tất cả tham số
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     * @param cause Exception gốc gây ra lỗi xác thực
     * @param details Map chứa thông tin chi tiết về lỗi xác thực
     */
    public AuthenticationException(ErrorCode errorCode, String message, Throwable cause, Map<String, Object> details) {
        super(errorCode, message, cause, details);
    }
    
    /**
     * Convenience method để tạo AuthenticationException cho invalid credentials
     * 
     * @return AuthenticationException với INVALID_CREDENTIALS error code
     */
    public static AuthenticationException invalidCredentials() {
        return new AuthenticationException(ErrorCode.INVALID_CREDENTIALS);
    }
    
    /**
     * Convenience method để tạo AuthenticationException cho invalid credentials với username
     * 
     * @param username Username đã thử đăng nhập
     * @return AuthenticationException với INVALID_CREDENTIALS error code và username trong details
     */
    public static AuthenticationException invalidCredentials(String username) {
        return new AuthenticationException(ErrorCode.INVALID_CREDENTIALS)
                .addDetail("username", username);
    }
    
    /**
     * Convenience method để tạo AuthenticationException cho expired token
     * 
     * @return AuthenticationException với TOKEN_EXPIRED error code
     */
    public static AuthenticationException tokenExpired() {
        return new AuthenticationException(ErrorCode.TOKEN_EXPIRED);
    }
    
    /**
     * Convenience method để tạo AuthenticationException cho invalid token
     * 
     * @return AuthenticationException với TOKEN_INVALID error code
     */
    public static AuthenticationException tokenInvalid() {
        return new AuthenticationException(ErrorCode.TOKEN_INVALID);
    }
    
    /**
     * Convenience method để tạo AuthenticationException cho invalid token với token info
     * 
     * @param tokenType Loại token (Bearer, JWT, etc.)
     * @return AuthenticationException với TOKEN_INVALID error code và token type trong details
     */
    public static AuthenticationException tokenInvalid(String tokenType) {
        return new AuthenticationException(ErrorCode.TOKEN_INVALID)
                .addDetail("tokenType", tokenType);
    }
    
    /**
     * Convenience method để tạo AuthenticationException cho authentication failed
     * 
     * @return AuthenticationException với AUTHENTICATION_FAILED error code
     */
    public static AuthenticationException authenticationFailed() {
        return new AuthenticationException(ErrorCode.AUTHENTICATION_FAILED);
    }
    
    /**
     * Convenience method để tạo AuthenticationException cho authentication failed với reason
     * 
     * @param reason Lý do authentication thất bại
     * @return AuthenticationException với AUTHENTICATION_FAILED error code và reason trong details
     */
    public static AuthenticationException authenticationFailed(String reason) {
        return new AuthenticationException(ErrorCode.AUTHENTICATION_FAILED)
                .addDetail("reason", reason);
    }
    
    /**
     * Override addDetail để return correct type cho method chaining
     * 
     * @param key Key của detail
     * @param value Value của detail
     * @return AuthenticationException instance để support method chaining
     */
    @Override
    public AuthenticationException addDetail(String key, Object value) {
        super.addDetail(key, value);
        return this;
    }
    
    /**
     * Override addDetails để return correct type cho method chaining
     * 
     * @param additionalDetails Map chứa các details cần thêm
     * @return AuthenticationException instance để support method chaining
     */
    @Override
    public AuthenticationException addDetails(Map<String, Object> additionalDetails) {
        super.addDetails(additionalDetails);
        return this;
    }
}