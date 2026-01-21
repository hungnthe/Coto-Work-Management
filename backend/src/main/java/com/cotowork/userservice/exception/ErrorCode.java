package com.cotowork.userservice.exception;

import org.springframework.http.HttpStatus;

/**
 * Enum định nghĩa tất cả các loại lỗi trong hệ thống với mã lỗi, thông điệp tiếng Việt và HTTP status code tương ứng.
 * Được sử dụng để chuẩn hóa việc xử lý lỗi trong toàn bộ ứng dụng.
 */
public enum ErrorCode {
    
    // Authentication Errors - Lỗi xác thực
    AUTHENTICATION_FAILED("AUTH_001", "Xác thực thất bại", HttpStatus.UNAUTHORIZED),
    INVALID_CREDENTIALS("AUTH_002", "Thông tin đăng nhập không hợp lệ", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED("AUTH_003", "Token đã hết hạn", HttpStatus.UNAUTHORIZED),
    TOKEN_INVALID("AUTH_004", "Token không hợp lệ", HttpStatus.UNAUTHORIZED),
    
    // Authorization Errors - Lỗi phân quyền
    ACCESS_DENIED("AUTHZ_001", "Không có quyền truy cập", HttpStatus.FORBIDDEN),
    INSUFFICIENT_PERMISSIONS("AUTHZ_002", "Không đủ quyền thực hiện thao tác", HttpStatus.FORBIDDEN),
    
    // Validation Errors - Lỗi validation
    VALIDATION_FAILED("VAL_001", "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    REQUIRED_FIELD_MISSING("VAL_002", "Thiếu trường bắt buộc", HttpStatus.BAD_REQUEST),
    INVALID_FORMAT("VAL_003", "Định dạng dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    
    // Resource Errors - Lỗi tài nguyên
    RESOURCE_NOT_FOUND("RES_001", "Không tìm thấy tài nguyên", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND("RES_002", "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    
    // Data Integrity Errors - Lỗi tính toàn vẹn dữ liệu
    DUPLICATE_DATA("DATA_001", "Dữ liệu đã tồn tại", HttpStatus.CONFLICT),
    DATA_INTEGRITY_VIOLATION("DATA_002", "Vi phạm tính toàn vẹn dữ liệu", HttpStatus.CONFLICT),
    
    // Server Errors - Lỗi máy chủ
    INTERNAL_SERVER_ERROR("SRV_001", "Lỗi máy chủ nội bộ", HttpStatus.INTERNAL_SERVER_ERROR),
    SERVICE_UNAVAILABLE("SRV_002", "Dịch vụ không khả dụng", HttpStatus.SERVICE_UNAVAILABLE);
    
    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
    
    /**
     * Constructor cho ErrorCode enum
     * 
     * @param code Mã lỗi duy nhất
     * @param message Thông điệp lỗi bằng tiếng Việt
     * @param httpStatus HTTP status code tương ứng
     */
    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
    
    /**
     * Lấy mã lỗi
     * 
     * @return Mã lỗi duy nhất
     */
    public String getCode() {
        return code;
    }
    
    /**
     * Lấy thông điệp lỗi
     * 
     * @return Thông điệp lỗi bằng tiếng Việt
     */
    public String getMessage() {
        return message;
    }
    
    /**
     * Lấy HTTP status code
     * 
     * @return HTTP status code tương ứng
     */
    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
    
    /**
     * Lấy HTTP status code dưới dạng số nguyên
     * 
     * @return HTTP status code dưới dạng số nguyên
     */
    public int getHttpStatusValue() {
        return httpStatus.value();
    }
}