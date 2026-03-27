package com.cotowork.userservice.exception;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

/**
 * Class đại diện cho chi tiết lỗi validation ở mức field.
 * Được sử dụng để cung cấp thông tin chi tiết về các lỗi validation
 * bao gồm tên field, giá trị bị từ chối và thông điệp lỗi.
 * 
 * Class này được thiết kế để sử dụng trong ValidationException
 * và ErrorResponse để cung cấp thông tin validation chi tiết cho client.
 * 
 * Requirements: 6.2, 6.3 - Field-level validation error information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationErrorDetail {
    
    /**
     * Tên của field bị lỗi validation
     */
    private String field;
    
    /**
     * Giá trị bị từ chối trong quá trình validation
     * Có thể là null nếu field không có giá trị
     */
    private Object rejectedValue;
    
    /**
     * Thông điệp lỗi mô tả chi tiết về lỗi validation
     */
    private String message;
    
    /**
     * Constructor tiện lợi để tạo ValidationErrorDetail với field và message
     * 
     * @param field Tên field bị lỗi
     * @param message Thông điệp lỗi
     */
    public ValidationErrorDetail(String field, String message) {
        this.field = field;
        this.message = message;
        this.rejectedValue = null;
    }
    
    /**
     * Static factory method để tạo ValidationErrorDetail cho required field missing
     * 
     * @param field Tên field bị thiếu
     * @return ValidationErrorDetail instance
     */
    public static ValidationErrorDetail requiredField(String field) {
        return ValidationErrorDetail.builder()
                .field(field)
                .message("Trường này là bắt buộc")
                .build();
    }
    
    /**
     * Static factory method để tạo ValidationErrorDetail cho invalid format
     * 
     * @param field Tên field có format không hợp lệ
     * @param rejectedValue Giá trị không hợp lệ
     * @return ValidationErrorDetail instance
     */
    public static ValidationErrorDetail invalidFormat(String field, Object rejectedValue) {
        return ValidationErrorDetail.builder()
                .field(field)
                .rejectedValue(rejectedValue)
                .message("Định dạng không hợp lệ")
                .build();
    }
    
    /**
     * Static factory method để tạo ValidationErrorDetail cho invalid format với custom message
     * 
     * @param field Tên field có format không hợp lệ
     * @param rejectedValue Giá trị không hợp lệ
     * @param message Thông điệp lỗi tùy chỉnh
     * @return ValidationErrorDetail instance
     */
    public static ValidationErrorDetail invalidFormat(String field, Object rejectedValue, String message) {
        return ValidationErrorDetail.builder()
                .field(field)
                .rejectedValue(rejectedValue)
                .message(message)
                .build();
    }
    
    /**
     * Static factory method để tạo ValidationErrorDetail cho invalid value
     * 
     * @param field Tên field có giá trị không hợp lệ
     * @param rejectedValue Giá trị không hợp lệ
     * @param message Thông điệp lỗi
     * @return ValidationErrorDetail instance
     */
    public static ValidationErrorDetail invalidValue(String field, Object rejectedValue, String message) {
        return ValidationErrorDetail.builder()
                .field(field)
                .rejectedValue(rejectedValue)
                .message(message)
                .build();
    }
    
    /**
     * Static factory method để tạo ValidationErrorDetail cho size constraint violation
     * 
     * @param field Tên field vi phạm size constraint
     * @param rejectedValue Giá trị vi phạm
     * @param min Giá trị tối thiểu
     * @param max Giá trị tối đa
     * @return ValidationErrorDetail instance
     */
    public static ValidationErrorDetail sizeViolation(String field, Object rejectedValue, int min, int max) {
        String message = String.format("Độ dài phải từ %d đến %d ký tự", min, max);
        return ValidationErrorDetail.builder()
                .field(field)
                .rejectedValue(rejectedValue)
                .message(message)
                .build();
    }
    
    /**
     * Static factory method để tạo ValidationErrorDetail cho pattern mismatch
     * 
     * @param field Tên field không khớp pattern
     * @param rejectedValue Giá trị không khớp
     * @param pattern Pattern mong đợi
     * @return ValidationErrorDetail instance
     */
    public static ValidationErrorDetail patternMismatch(String field, Object rejectedValue, String pattern) {
        String message = String.format("Giá trị không khớp với định dạng yêu cầu: %s", pattern);
        return ValidationErrorDetail.builder()
                .field(field)
                .rejectedValue(rejectedValue)
                .message(message)
                .build();
    }
    
    /**
     * Static factory method để tạo ValidationErrorDetail cho email format
     * 
     * @param field Tên field email không hợp lệ
     * @param rejectedValue Giá trị email không hợp lệ
     * @return ValidationErrorDetail instance
     */
    public static ValidationErrorDetail invalidEmail(String field, Object rejectedValue) {
        return ValidationErrorDetail.builder()
                .field(field)
                .rejectedValue(rejectedValue)
                .message("Định dạng email không hợp lệ")
                .build();
    }
    
    /**
     * Static factory method để tạo ValidationErrorDetail cho numeric range violation
     * 
     * @param field Tên field vi phạm range
     * @param rejectedValue Giá trị vi phạm
     * @param min Giá trị tối thiểu
     * @param max Giá trị tối đa
     * @return ValidationErrorDetail instance
     */
    public static ValidationErrorDetail rangeViolation(String field, Object rejectedValue, Number min, Number max) {
        String message = String.format("Giá trị phải từ %s đến %s", min, max);
        return ValidationErrorDetail.builder()
                .field(field)
                .rejectedValue(rejectedValue)
                .message(message)
                .build();
    }
    
    /**
     * Kiểm tra xem ValidationErrorDetail có hợp lệ không
     * 
     * @return true nếu có field name và message
     */
    @JsonIgnore
    public boolean isValid() {
        return field != null && !field.trim().isEmpty() &&
               message != null && !message.trim().isEmpty();
    }
    
    /**
     * Kiểm tra xem có rejected value không
     * 
     * @return true nếu có rejected value
     */
    @JsonIgnore
    public boolean hasRejectedValue() {
        return rejectedValue != null;
    }
    
    /**
     * Lấy rejected value dưới dạng String
     * 
     * @return String representation của rejected value hoặc "null" nếu không có
     */
    @JsonIgnore
    public String getRejectedValueAsString() {
        return rejectedValue != null ? rejectedValue.toString() : "null";
    }
    
    /**
     * Override toString để cung cấp thông tin debug hữu ích
     * 
     * @return String representation của ValidationErrorDetail
     */
    @Override
    public String toString() {
        return String.format("ValidationErrorDetail{field='%s', rejectedValue=%s, message='%s'}", 
                           field, rejectedValue, message);
    }
    
    /**
     * Tạo một copy của ValidationErrorDetail với message mới
     * 
     * @param newMessage Message mới
     * @return ValidationErrorDetail mới với message được cập nhật
     */
    public ValidationErrorDetail withMessage(String newMessage) {
        return ValidationErrorDetail.builder()
                .field(this.field)
                .rejectedValue(this.rejectedValue)
                .message(newMessage)
                .build();
    }
    
    /**
     * Tạo một copy của ValidationErrorDetail với rejected value mới
     * 
     * @param newRejectedValue Rejected value mới
     * @return ValidationErrorDetail mới với rejected value được cập nhật
     */
    public ValidationErrorDetail withRejectedValue(Object newRejectedValue) {
        return ValidationErrorDetail.builder()
                .field(this.field)
                .rejectedValue(newRejectedValue)
                .message(this.message)
                .build();
    }
}