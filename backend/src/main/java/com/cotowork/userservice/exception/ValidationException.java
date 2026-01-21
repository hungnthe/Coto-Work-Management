package com.cotowork.userservice.exception;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Exception class cho các lỗi validation dữ liệu.
 * Được sử dụng khi dữ liệu đầu vào không hợp lệ, thiếu trường bắt buộc, hoặc không đúng định dạng.
 * 
 * Extends BusinessException để tận dụng cấu trúc chuẩn hóa với ErrorCode và details map.
 * Bổ sung thêm field-level error information để hỗ trợ validation chi tiết.
 */
public class ValidationException extends BusinessException {
    
    private final List<FieldError> fieldErrors;
    
    /**
     * Constructor với ErrorCode
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum (thường là các VAL_* codes)
     */
    public ValidationException(ErrorCode errorCode) {
        super(errorCode);
        this.fieldErrors = new ArrayList<>();
    }
    
    /**
     * Constructor với ErrorCode và custom message
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     */
    public ValidationException(ErrorCode errorCode, String message) {
        super(errorCode, message);
        this.fieldErrors = new ArrayList<>();
    }
    
    /**
     * Constructor với ErrorCode và cause
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param cause Exception gốc gây ra lỗi validation
     */
    public ValidationException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
        this.fieldErrors = new ArrayList<>();
    }
    
    /**
     * Constructor với ErrorCode, custom message và cause
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     * @param cause Exception gốc gây ra lỗi validation
     */
    public ValidationException(ErrorCode errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
        this.fieldErrors = new ArrayList<>();
    }
    
    /**
     * Constructor với ErrorCode và details map
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param details Map chứa thông tin chi tiết về lỗi validation
     */
    public ValidationException(ErrorCode errorCode, Map<String, Object> details) {
        super(errorCode, details);
        this.fieldErrors = new ArrayList<>();
    }
    
    /**
     * Constructor với ErrorCode và field errors
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param fieldErrors Danh sách các lỗi field-level
     */
    public ValidationException(ErrorCode errorCode, List<FieldError> fieldErrors) {
        super(errorCode);
        this.fieldErrors = fieldErrors != null ? new ArrayList<>(fieldErrors) : new ArrayList<>();
    }
    
    /**
     * Constructor đầy đủ với tất cả tham số
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     * @param cause Exception gốc gây ra lỗi validation
     * @param details Map chứa thông tin chi tiết về lỗi validation
     * @param fieldErrors Danh sách các lỗi field-level
     */
    public ValidationException(ErrorCode errorCode, String message, Throwable cause, Map<String, Object> details, List<FieldError> fieldErrors) {
        super(errorCode, message, cause, details);
        this.fieldErrors = fieldErrors != null ? new ArrayList<>(fieldErrors) : new ArrayList<>();
    }
    
    /**
     * Lấy danh sách field errors
     * 
     * @return Danh sách các lỗi field-level
     */
    public List<FieldError> getFieldErrors() {
        return new ArrayList<>(fieldErrors);
    }
    
    /**
     * Thêm field error vào danh sách
     * 
     * @param fieldError Field error cần thêm
     * @return ValidationException instance để support method chaining
     */
    public ValidationException addFieldError(FieldError fieldError) {
        if (fieldError != null) {
            this.fieldErrors.add(fieldError);
        }
        return this;
    }
    
    /**
     * Thêm field error với field name và message
     * 
     * @param field Tên field bị lỗi
     * @param message Thông điệp lỗi cho field
     * @return ValidationException instance để support method chaining
     */
    public ValidationException addFieldError(String field, String message) {
        return addFieldError(new FieldError(field, null, message));
    }
    
    /**
     * Thêm field error với field name, rejected value và message
     * 
     * @param field Tên field bị lỗi
     * @param rejectedValue Giá trị bị từ chối
     * @param message Thông điệp lỗi cho field
     * @return ValidationException instance để support method chaining
     */
    public ValidationException addFieldError(String field, Object rejectedValue, String message) {
        return addFieldError(new FieldError(field, rejectedValue, message));
    }
    
    /**
     * Thêm nhiều field errors vào danh sách
     * 
     * @param fieldErrors Danh sách field errors cần thêm
     * @return ValidationException instance để support method chaining
     */
    public ValidationException addFieldErrors(List<FieldError> fieldErrors) {
        if (fieldErrors != null) {
            this.fieldErrors.addAll(fieldErrors);
        }
        return this;
    }
    
    /**
     * Kiểm tra xem có field errors không
     * 
     * @return true nếu có field errors
     */
    public boolean hasFieldErrors() {
        return !fieldErrors.isEmpty();
    }
    
    /**
     * Lấy số lượng field errors
     * 
     * @return Số lượng field errors
     */
    public int getFieldErrorCount() {
        return fieldErrors.size();
    }
    
    /**
     * Convenience method để tạo ValidationException cho validation failed
     * 
     * @return ValidationException với VALIDATION_FAILED error code
     */
    public static ValidationException validationFailed() {
        return new ValidationException(ErrorCode.VALIDATION_FAILED);
    }
    
    /**
     * Convenience method để tạo ValidationException cho validation failed với message
     * 
     * @param message Thông điệp lỗi tùy chỉnh
     * @return ValidationException với VALIDATION_FAILED error code và custom message
     */
    public static ValidationException validationFailed(String message) {
        return new ValidationException(ErrorCode.VALIDATION_FAILED, message);
    }
    
    /**
     * Convenience method để tạo ValidationException cho required field missing
     * 
     * @param fieldName Tên field bị thiếu
     * @return ValidationException với REQUIRED_FIELD_MISSING error code và field error
     */
    public static ValidationException requiredFieldMissing(String fieldName) {
        return new ValidationException(ErrorCode.REQUIRED_FIELD_MISSING)
                .addFieldError(fieldName, "Trường này là bắt buộc");
    }
    
    /**
     * Convenience method để tạo ValidationException cho invalid format
     * 
     * @param fieldName Tên field có format không hợp lệ
     * @param value Giá trị không hợp lệ
     * @return ValidationException với INVALID_FORMAT error code và field error
     */
    public static ValidationException invalidFormat(String fieldName, Object value) {
        return new ValidationException(ErrorCode.INVALID_FORMAT)
                .addFieldError(fieldName, value, "Định dạng không hợp lệ");
    }
    
    /**
     * Convenience method để tạo ValidationException cho invalid format với custom message
     * 
     * @param fieldName Tên field có format không hợp lệ
     * @param value Giá trị không hợp lệ
     * @param message Thông điệp lỗi tùy chỉnh
     * @return ValidationException với INVALID_FORMAT error code và field error
     */
    public static ValidationException invalidFormat(String fieldName, Object value, String message) {
        return new ValidationException(ErrorCode.INVALID_FORMAT)
                .addFieldError(fieldName, value, message);
    }
    
    /**
     * Override addDetail để return correct type cho method chaining
     * 
     * @param key Key của detail
     * @param value Value của detail
     * @return ValidationException instance để support method chaining
     */
    @Override
    public ValidationException addDetail(String key, Object value) {
        super.addDetail(key, value);
        return this;
    }
    
    /**
     * Override addDetails để return correct type cho method chaining
     * 
     * @param additionalDetails Map chứa các details cần thêm
     * @return ValidationException instance để support method chaining
     */
    @Override
    public ValidationException addDetails(Map<String, Object> additionalDetails) {
        super.addDetails(additionalDetails);
        return this;
    }
    
    /**
     * Inner class để represent field-level validation error
     */
    public static class FieldError {
        private final String field;
        private final Object rejectedValue;
        private final String message;
        
        public FieldError(String field, Object rejectedValue, String message) {
            this.field = field;
            this.rejectedValue = rejectedValue;
            this.message = message;
        }
        
        public String getField() {
            return field;
        }
        
        public Object getRejectedValue() {
            return rejectedValue;
        }
        
        public String getMessage() {
            return message;
        }
        
        @Override
        public String toString() {
            return String.format("FieldError{field='%s', rejectedValue=%s, message='%s'}", 
                               field, rejectedValue, message);
        }
    }
}