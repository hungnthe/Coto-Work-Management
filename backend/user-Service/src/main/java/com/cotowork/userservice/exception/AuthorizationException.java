package com.cotowork.userservice.exception;

import java.util.Map;

/**
 * Exception class cho các lỗi phân quyền (authorization).
 * Được sử dụng khi người dùng đã xác thực thành công nhưng không có quyền truy cập tài nguyên hoặc thực hiện hành động.
 * 
 * Extends BusinessException để tận dụng cấu trúc chuẩn hóa với ErrorCode và details map.
 */
public class AuthorizationException extends BusinessException {
    
    /**
     * Constructor với ErrorCode
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum (thường là các AUTHZ_* codes)
     */
    public AuthorizationException(ErrorCode errorCode) {
        super(errorCode);
    }
    
    /**
     * Constructor với ErrorCode và custom message
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     */
    public AuthorizationException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
    
    /**
     * Constructor với ErrorCode và cause
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param cause Exception gốc gây ra lỗi phân quyền
     */
    public AuthorizationException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }
    
    /**
     * Constructor với ErrorCode, custom message và cause
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     * @param cause Exception gốc gây ra lỗi phân quyền
     */
    public AuthorizationException(ErrorCode errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
    
    /**
     * Constructor với ErrorCode và details map
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param details Map chứa thông tin chi tiết về lỗi phân quyền (resource, action, user, etc.)
     */
    public AuthorizationException(ErrorCode errorCode, Map<String, Object> details) {
        super(errorCode, details);
    }
    
    /**
     * Constructor đầy đủ với tất cả tham số
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     * @param cause Exception gốc gây ra lỗi phân quyền
     * @param details Map chứa thông tin chi tiết về lỗi phân quyền
     */
    public AuthorizationException(ErrorCode errorCode, String message, Throwable cause, Map<String, Object> details) {
        super(errorCode, message, cause, details);
    }
    
    /**
     * Convenience method để tạo AuthorizationException cho access denied
     * 
     * @return AuthorizationException với ACCESS_DENIED error code
     */
    public static AuthorizationException accessDenied() {
        return new AuthorizationException(ErrorCode.ACCESS_DENIED);
    }
    
    /**
     * Convenience method để tạo AuthorizationException cho access denied với resource info
     * 
     * @param resource Tài nguyên bị từ chối truy cập
     * @return AuthorizationException với ACCESS_DENIED error code và resource trong details
     */
    public static AuthorizationException accessDenied(String resource) {
        return new AuthorizationException(ErrorCode.ACCESS_DENIED)
                .addDetail("resource", resource);
    }
    
    /**
     * Convenience method để tạo AuthorizationException cho access denied với resource và action
     * 
     * @param resource Tài nguyên bị từ chối truy cập
     * @param action Hành động bị từ chối
     * @return AuthorizationException với ACCESS_DENIED error code và resource, action trong details
     */
    public static AuthorizationException accessDenied(String resource, String action) {
        return new AuthorizationException(ErrorCode.ACCESS_DENIED)
                .addDetail("resource", resource)
                .addDetail("action", action);
    }
    
    /**
     * Convenience method để tạo AuthorizationException cho insufficient permissions
     * 
     * @return AuthorizationException với INSUFFICIENT_PERMISSIONS error code
     */
    public static AuthorizationException insufficientPermissions() {
        return new AuthorizationException(ErrorCode.INSUFFICIENT_PERMISSIONS);
    }
    
    /**
     * Convenience method để tạo AuthorizationException cho insufficient permissions với required permission
     * 
     * @param requiredPermission Quyền cần thiết để thực hiện hành động
     * @return AuthorizationException với INSUFFICIENT_PERMISSIONS error code và required permission trong details
     */
    public static AuthorizationException insufficientPermissions(String requiredPermission) {
        return new AuthorizationException(ErrorCode.INSUFFICIENT_PERMISSIONS)
                .addDetail("requiredPermission", requiredPermission);
    }
    
    /**
     * Convenience method để tạo AuthorizationException cho insufficient permissions với multiple permissions
     * 
     * @param requiredPermissions Danh sách các quyền cần thiết
     * @return AuthorizationException với INSUFFICIENT_PERMISSIONS error code và required permissions trong details
     */
    public static AuthorizationException insufficientPermissions(String[] requiredPermissions) {
        return new AuthorizationException(ErrorCode.INSUFFICIENT_PERMISSIONS)
                .addDetail("requiredPermissions", requiredPermissions);
    }
    
    /**
     * Convenience method để tạo AuthorizationException cho insufficient permissions với user và resource info
     * 
     * @param userId ID của user
     * @param resource Tài nguyên cần truy cập
     * @param requiredPermission Quyền cần thiết
     * @return AuthorizationException với INSUFFICIENT_PERMISSIONS error code và thông tin chi tiết
     */
    public static AuthorizationException insufficientPermissions(String userId, String resource, String requiredPermission) {
        return new AuthorizationException(ErrorCode.INSUFFICIENT_PERMISSIONS)
                .addDetail("userId", userId)
                .addDetail("resource", resource)
                .addDetail("requiredPermission", requiredPermission);
    }
    
    /**
     * Override addDetail để return correct type cho method chaining
     * 
     * @param key Key của detail
     * @param value Value của detail
     * @return AuthorizationException instance để support method chaining
     */
    @Override
    public AuthorizationException addDetail(String key, Object value) {
        super.addDetail(key, value);
        return this;
    }
    
    /**
     * Override addDetails để return correct type cho method chaining
     * 
     * @param additionalDetails Map chứa các details cần thêm
     * @return AuthorizationException instance để support method chaining
     */
    @Override
    public AuthorizationException addDetails(Map<String, Object> additionalDetails) {
        super.addDetails(additionalDetails);
        return this;
    }
}