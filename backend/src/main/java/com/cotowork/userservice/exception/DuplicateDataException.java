package com.cotowork.userservice.exception;

import java.util.Map;

/**
 * Exception class cho các lỗi dữ liệu trùng lặp.
 * Được sử dụng khi cố gắng tạo hoặc cập nhật dữ liệu mà vi phạm constraint unique hoặc dữ liệu đã tồn tại.
 * 
 * Extends BusinessException để tận dụng cấu trúc chuẩn hóa với ErrorCode và details map.
 */
public class DuplicateDataException extends BusinessException {
    
    /**
     * Constructor với ErrorCode
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum (thường là các DATA_* codes)
     */
    public DuplicateDataException(ErrorCode errorCode) {
        super(errorCode);
    }
    
    /**
     * Constructor với ErrorCode và custom message
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     */
    public DuplicateDataException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
    
    /**
     * Constructor với ErrorCode và cause
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param cause Exception gốc gây ra lỗi (thường là database constraint violation)
     */
    public DuplicateDataException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }
    
    /**
     * Constructor với ErrorCode, custom message và cause
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     * @param cause Exception gốc gây ra lỗi
     */
    public DuplicateDataException(ErrorCode errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
    
    /**
     * Constructor với ErrorCode và details map
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param details Map chứa thông tin chi tiết về dữ liệu trùng lặp
     */
    public DuplicateDataException(ErrorCode errorCode, Map<String, Object> details) {
        super(errorCode, details);
    }
    
    /**
     * Constructor đầy đủ với tất cả tham số
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     * @param cause Exception gốc gây ra lỗi
     * @param details Map chứa thông tin chi tiết về dữ liệu trùng lặp
     */
    public DuplicateDataException(ErrorCode errorCode, String message, Throwable cause, Map<String, Object> details) {
        super(errorCode, message, cause, details);
    }
    
    /**
     * Convenience method để tạo DuplicateDataException cho duplicate data
     * 
     * @return DuplicateDataException với DUPLICATE_DATA error code
     */
    public static DuplicateDataException duplicateData() {
        return new DuplicateDataException(ErrorCode.DUPLICATE_DATA);
    }
    
    /**
     * Convenience method để tạo DuplicateDataException cho duplicate data với field name
     * 
     * @param fieldName Tên field bị trùng lặp
     * @return DuplicateDataException với DUPLICATE_DATA error code và field name trong details
     */
    public static DuplicateDataException duplicateData(String fieldName) {
        return new DuplicateDataException(ErrorCode.DUPLICATE_DATA)
                .addDetail("duplicateField", fieldName);
    }
    
    /**
     * Convenience method để tạo DuplicateDataException cho duplicate data với field name và value
     * 
     * @param fieldName Tên field bị trùng lặp
     * @param value Giá trị bị trùng lặp
     * @return DuplicateDataException với DUPLICATE_DATA error code và thông tin chi tiết
     */
    public static DuplicateDataException duplicateData(String fieldName, Object value) {
        return new DuplicateDataException(ErrorCode.DUPLICATE_DATA)
                .addDetail("duplicateField", fieldName)
                .addDetail("duplicateValue", value);
    }
    
    /**
     * Convenience method để tạo DuplicateDataException cho duplicate username
     * 
     * @param username Username bị trùng lặp
     * @return DuplicateDataException với DUPLICATE_DATA error code và username trong details
     */
    public static DuplicateDataException duplicateUsername(String username) {
        return new DuplicateDataException(ErrorCode.DUPLICATE_DATA)
                .addDetail("duplicateField", "username")
                .addDetail("duplicateValue", username);
    }
    
    /**
     * Convenience method để tạo DuplicateDataException cho duplicate email
     * 
     * @param email Email bị trùng lặp
     * @return DuplicateDataException với DUPLICATE_DATA error code và email trong details
     */
    public static DuplicateDataException duplicateEmail(String email) {
        return new DuplicateDataException(ErrorCode.DUPLICATE_DATA)
                .addDetail("duplicateField", "email")
                .addDetail("duplicateValue", email);
    }
    
    /**
     * Convenience method để tạo DuplicateDataException cho data integrity violation
     * 
     * @return DuplicateDataException với DATA_INTEGRITY_VIOLATION error code
     */
    public static DuplicateDataException dataIntegrityViolation() {
        return new DuplicateDataException(ErrorCode.DATA_INTEGRITY_VIOLATION);
    }
    
    /**
     * Convenience method để tạo DuplicateDataException cho data integrity violation với constraint name
     * 
     * @param constraintName Tên constraint bị vi phạm
     * @return DuplicateDataException với DATA_INTEGRITY_VIOLATION error code và constraint name trong details
     */
    public static DuplicateDataException dataIntegrityViolation(String constraintName) {
        return new DuplicateDataException(ErrorCode.DATA_INTEGRITY_VIOLATION)
                .addDetail("constraintName", constraintName);
    }
    
    /**
     * Convenience method để tạo DuplicateDataException cho data integrity violation với cause
     * 
     * @param cause Exception gốc (thường là database exception)
     * @return DuplicateDataException với DATA_INTEGRITY_VIOLATION error code và cause
     */
    public static DuplicateDataException dataIntegrityViolation(Throwable cause) {
        return new DuplicateDataException(ErrorCode.DATA_INTEGRITY_VIOLATION, cause);
    }
    
    /**
     * Override addDetail để return correct type cho method chaining
     * 
     * @param key Key của detail
     * @param value Value của detail
     * @return DuplicateDataException instance để support method chaining
     */
    @Override
    public DuplicateDataException addDetail(String key, Object value) {
        super.addDetail(key, value);
        return this;
    }
    
    /**
     * Override addDetails để return correct type cho method chaining
     * 
     * @param additionalDetails Map chứa các details cần thêm
     * @return DuplicateDataException instance để support method chaining
     */
    @Override
    public DuplicateDataException addDetails(Map<String, Object> additionalDetails) {
        super.addDetails(additionalDetails);
        return this;
    }
}