package com.cotowork.userservice.exception;

import java.util.Map;

/**
 * Exception class cho các lỗi không tìm thấy tài nguyên.
 * Được sử dụng khi tài nguyên được yêu cầu không tồn tại trong hệ thống (user not found, resource not found, etc.)
 * 
 * Extends BusinessException để tận dụng cấu trúc chuẩn hóa với ErrorCode và details map.
 */
public class ResourceNotFoundException extends BusinessException {
    
    /**
     * Constructor với ErrorCode
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum (thường là các RES_* codes)
     */
    public ResourceNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
    
    /**
     * Constructor với ErrorCode và custom message
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     */
    public ResourceNotFoundException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
    
    /**
     * Constructor với ErrorCode và cause
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param cause Exception gốc gây ra lỗi
     */
    public ResourceNotFoundException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }
    
    /**
     * Constructor với ErrorCode, custom message và cause
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     * @param cause Exception gốc gây ra lỗi
     */
    public ResourceNotFoundException(ErrorCode errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
    
    /**
     * Constructor với ErrorCode và details map
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param details Map chứa thông tin chi tiết về tài nguyên không tìm thấy
     */
    public ResourceNotFoundException(ErrorCode errorCode, Map<String, Object> details) {
        super(errorCode, details);
    }
    
    /**
     * Constructor đầy đủ với tất cả tham số
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     * @param cause Exception gốc gây ra lỗi
     * @param details Map chứa thông tin chi tiết về tài nguyên không tìm thấy
     */
    public ResourceNotFoundException(ErrorCode errorCode, String message, Throwable cause, Map<String, Object> details) {
        super(errorCode, message, cause, details);
    }
    
    /**
     * Backward compatibility constructor với message
     * 
     * @param message Thông điệp lỗi
     * @deprecated Sử dụng constructor với ErrorCode để có error handling chuẩn hóa
     */
    @Deprecated
    public ResourceNotFoundException(String message) {
        super(ErrorCode.RESOURCE_NOT_FOUND, message);
    }
    
    /**
     * Convenience method để tạo ResourceNotFoundException cho resource not found
     * 
     * @return ResourceNotFoundException với RESOURCE_NOT_FOUND error code
     */
    public static ResourceNotFoundException resourceNotFound() {
        return new ResourceNotFoundException(ErrorCode.RESOURCE_NOT_FOUND);
    }
    
    /**
     * Convenience method để tạo ResourceNotFoundException cho resource not found với resource type
     * 
     * @param resourceType Loại tài nguyên không tìm thấy
     * @return ResourceNotFoundException với RESOURCE_NOT_FOUND error code và resource type trong details
     */
    public static ResourceNotFoundException resourceNotFound(String resourceType) {
        return new ResourceNotFoundException(ErrorCode.RESOURCE_NOT_FOUND)
                .addDetail("resourceType", resourceType);
    }
    
    /**
     * Convenience method để tạo ResourceNotFoundException cho resource not found với resource type và ID
     * 
     * @param resourceType Loại tài nguyên không tìm thấy
     * @param resourceId ID của tài nguyên không tìm thấy
     * @return ResourceNotFoundException với RESOURCE_NOT_FOUND error code và thông tin chi tiết
     */
    public static ResourceNotFoundException resourceNotFound(String resourceType, Object resourceId) {
        return new ResourceNotFoundException(ErrorCode.RESOURCE_NOT_FOUND)
                .addDetail("resourceType", resourceType)
                .addDetail("resourceId", resourceId);
    }
    
    /**
     * Convenience method để tạo ResourceNotFoundException cho user not found
     * 
     * @return ResourceNotFoundException với USER_NOT_FOUND error code
     */
    public static ResourceNotFoundException userNotFound() {
        return new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND);
    }
    
    /**
     * Convenience method để tạo ResourceNotFoundException cho user not found với user ID
     * 
     * @param userId ID của user không tìm thấy
     * @return ResourceNotFoundException với USER_NOT_FOUND error code và user ID trong details
     */
    public static ResourceNotFoundException userNotFound(Object userId) {
        return new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND)
                .addDetail("userId", userId);
    }
    
    /**
     * Convenience method để tạo ResourceNotFoundException cho user not found với username
     * 
     * @param username Username của user không tìm thấy
     * @return ResourceNotFoundException với USER_NOT_FOUND error code và username trong details
     */
    public static ResourceNotFoundException userNotFoundByUsername(String username) {
        return new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND)
                .addDetail("username", username);
    }
    
    /**
     * Override addDetail để return correct type cho method chaining
     * 
     * @param key Key của detail
     * @param value Value của detail
     * @return ResourceNotFoundException instance để support method chaining
     */
    @Override
    public ResourceNotFoundException addDetail(String key, Object value) {
        super.addDetail(key, value);
        return this;
    }
    
    /**
     * Override addDetails để return correct type cho method chaining
     * 
     * @param additionalDetails Map chứa các details cần thêm
     * @return ResourceNotFoundException instance để support method chaining
     */
    @Override
    public ResourceNotFoundException addDetails(Map<String, Object> additionalDetails) {
        super.addDetails(additionalDetails);
        return this;
    }
}
