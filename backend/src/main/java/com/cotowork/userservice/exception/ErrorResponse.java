package com.cotowork.userservice.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Standard error response class cho tất cả các lỗi trong hệ thống.
 * Cung cấp format chuẩn hóa để trả về lỗi cho client với đầy đủ thông tin cần thiết.
 * 
 * Được sử dụng bởi Global Exception Handler để tạo consistent error responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    
    /**
     * Mã lỗi duy nhất từ ErrorCode enum
     */
    @JsonProperty("error_code")
    private String errorCode;
    
    /**
     * Thông điệp lỗi bằng tiếng Việt
     */
    @JsonProperty("error_message")
    private String errorMessage;
    
    /**
     * Thời gian xảy ra lỗi
     */
    @JsonProperty("timestamp")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    
    /**
     * HTTP status code dưới dạng số nguyên
     */
    @JsonProperty("http_status")
    private int httpStatus;
    
    /**
     * Đường dẫn API nơi xảy ra lỗi
     */
    @JsonProperty("path")
    private String path;
    
    /**
     * Thông tin chi tiết về lỗi (validation errors, additional context, etc.)
     */
    @JsonProperty("details")
    private Map<String, Object> details;
    
    /**
     * Static factory method để tạo ErrorResponse từ ErrorCode
     * 
     * @param errorCode ErrorCode enum value
     * @param path Request path nơi xảy ra lỗi
     * @return ErrorResponse instance
     */
    public static ErrorResponse from(ErrorCode errorCode, String path) {
        return ErrorResponse.builder()
                .errorCode(errorCode.getCode())
                .errorMessage(errorCode.getMessage())
                .timestamp(LocalDateTime.now())
                .httpStatus(errorCode.getHttpStatusValue())
                .path(path)
                .build();
    }
    
    /**
     * Static factory method để tạo ErrorResponse từ ErrorCode với custom message
     * 
     * @param errorCode ErrorCode enum value
     * @param customMessage Custom error message
     * @param path Request path nơi xảy ra lỗi
     * @return ErrorResponse instance
     */
    public static ErrorResponse from(ErrorCode errorCode, String customMessage, String path) {
        return ErrorResponse.builder()
                .errorCode(errorCode.getCode())
                .errorMessage(customMessage)
                .timestamp(LocalDateTime.now())
                .httpStatus(errorCode.getHttpStatusValue())
                .path(path)
                .build();
    }
    
    /**
     * Static factory method để tạo ErrorResponse từ BusinessException
     * 
     * @param exception BusinessException instance
     * @param path Request path nơi xảy ra lỗi
     * @return ErrorResponse instance
     */
    public static ErrorResponse from(BusinessException exception, String path) {
        return ErrorResponse.builder()
                .errorCode(exception.getErrorCode().getCode())
                .errorMessage(exception.getMessage())
                .timestamp(LocalDateTime.now())
                .httpStatus(exception.getErrorCode().getHttpStatusValue())
                .path(path)
                .details(exception.getDetails())
                .build();
    }
    
    /**
     * Thêm detail vào details map
     * 
     * @param key Key của detail
     * @param value Value của detail
     * @return ErrorResponse instance để support method chaining
     */
    public ErrorResponse addDetail(String key, Object value) {
        if (this.details == null) {
            this.details = new java.util.HashMap<>();
        }
        this.details.put(key, value);
        return this;
    }
    
    /**
     * Thêm nhiều details vào details map
     * 
     * @param additionalDetails Map chứa các details cần thêm
     * @return ErrorResponse instance để support method chaining
     */
    public ErrorResponse addDetails(Map<String, Object> additionalDetails) {
        if (additionalDetails != null) {
            if (this.details == null) {
                this.details = new java.util.HashMap<>();
            }
            this.details.putAll(additionalDetails);
        }
        return this;
    }
    
    /**
     * Kiểm tra xem ErrorResponse có hợp lệ không (có đủ required fields)
     * 
     * @return true nếu ErrorResponse hợp lệ
     */
    public boolean isValid() {
        return errorCode != null && !errorCode.trim().isEmpty() &&
               errorMessage != null && !errorMessage.trim().isEmpty() &&
               timestamp != null &&
               httpStatus > 0 &&
               path != null;
    }
    
    /**
     * Kiểm tra xem có details nào không
     * 
     * @return true nếu không có details nào
     */
    public boolean hasNoDetails() {
        return details == null || details.isEmpty();
    }
    
    /**
     * Lấy số lượng details
     * 
     * @return Số lượng details trong map
     */
    public int getDetailsCount() {
        return details != null ? details.size() : 0;
    }
    
    /**
     * Custom getter cho details để đảm bảo immutability
     * Trả về defensive copy của details map
     * 
     * @return Defensive copy của details map hoặc null nếu không có details
     */
    public Map<String, Object> getDetails() {
        return details != null ? new HashMap<>(details) : null;
    }
}
