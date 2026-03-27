package com.cotowork.userservice.exception;

/**
 * Exception class cho các lỗi tài nguyên trùng lặp.
 * 
 * @deprecated Sử dụng DuplicateDataException thay thế để có error handling chuẩn hóa
 */
@Deprecated
public class DuplicateResourceException extends DuplicateDataException {
    
    /**
     * Backward compatibility constructor với message
     * 
     * @param message Thông điệp lỗi
     */
    public DuplicateResourceException(String message) {
        super(ErrorCode.DUPLICATE_DATA, message);
    }
}
