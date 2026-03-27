package com.cotowork.userservice.exception;

import org.springframework.http.HttpStatus;

/**
 * Enum định nghĩa tất cả các loại lỗi trong hệ thống.
 */
public enum ErrorCode {
    
    // Authentication Errors - Lỗi xác thực
    AUTHENTICATION_FAILED("AUTH_001", "Xác thực thất bại", HttpStatus.UNAUTHORIZED),
    INVALID_CREDENTIALS("AUTH_002", "Thông tin đăng nhập không hợp lệ", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED("AUTH_003", "Token đã hết hạn", HttpStatus.UNAUTHORIZED),
    TOKEN_INVALID("AUTH_004", "Token không hợp lệ", HttpStatus.UNAUTHORIZED),
    
    // --- BỔ SUNG MỚI ---
    UNAUTHENTICATED("AUTH_005", "Chưa đăng nhập hoặc phiên đăng nhập hết hạn", HttpStatus.UNAUTHORIZED),
    // -------------------

    // Authorization Errors - Lỗi phân quyền
    ACCESS_DENIED("AUTHZ_001", "Không có quyền truy cập", HttpStatus.FORBIDDEN),
    INSUFFICIENT_PERMISSIONS("AUTHZ_002", "Không đủ quyền thực hiện thao tác", HttpStatus.FORBIDDEN),
    
    // Validation Errors - Lỗi validation
    VALIDATION_FAILED("VAL_001", "Dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    REQUIRED_FIELD_MISSING("VAL_002", "Thiếu trường bắt buộc", HttpStatus.BAD_REQUEST),
    INVALID_FORMAT("VAL_003", "Định dạng dữ liệu không hợp lệ", HttpStatus.BAD_REQUEST),
    
    // Các mã lỗi cho AccountService
    INVALID_PASSWORD("VAL_004", "Mật khẩu không chính xác", HttpStatus.BAD_REQUEST),
    PASSWORD_MUST_BE_DIFFERENT("VAL_005", "Mật khẩu mới phải khác mật khẩu hiện tại", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED("VAL_006", "Email đã tồn tại trong hệ thống", HttpStatus.BAD_REQUEST),
    
    // Resource Errors - Lỗi tài nguyên
    RESOURCE_NOT_FOUND("RES_001", "Không tìm thấy tài nguyên", HttpStatus.NOT_FOUND),
    USER_NOT_FOUND("RES_002", "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    
    // --- BỔ SUNG MỚI ĐỂ KHỚP VỚI CODE SERVICE ---
    USER_NOT_EXISTED("RES_003", "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    // --------------------------------------------
    
    // Data Integrity Errors
    DUPLICATE_DATA("DATA_001", "Dữ liệu đã tồn tại", HttpStatus.CONFLICT),
    DATA_INTEGRITY_VIOLATION("DATA_002", "Vi phạm tính toàn vẹn dữ liệu", HttpStatus.CONFLICT),
    
    // Server Errors
    INTERNAL_SERVER_ERROR("SRV_001", "Lỗi máy chủ nội bộ", HttpStatus.INTERNAL_SERVER_ERROR),
    
    // Dòng cuối cùng nhớ là dấu chấm phẩy (;)
    SERVICE_UNAVAILABLE("SRV_002", "Dịch vụ không khả dụng", HttpStatus.SERVICE_UNAVAILABLE);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
    
    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getMessage() {
        return message;
    }
    
    public HttpStatus getHttpStatus() {
        return httpStatus;
    }
    
    public int getHttpStatusValue() {
        return httpStatus.value();
    }
}