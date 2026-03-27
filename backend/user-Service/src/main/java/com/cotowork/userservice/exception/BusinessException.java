package com.cotowork.userservice.exception;

import java.util.HashMap;
import java.util.Map;

/**
 * Base exception class cho tất cả các business logic exceptions trong hệ thống.
 * Cung cấp cấu trúc chuẩn hóa với ErrorCode và details map để xử lý lỗi nhất quán.
 * 
 * Được sử dụng bởi Global Exception Handler để tạo standard error responses.
 */
public class BusinessException extends RuntimeException {
    
    private final ErrorCode errorCode;
    private final Map<String, Object> details;
    
    /**
     * Constructor với ErrorCode
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     */
    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.details = new HashMap<>();
    }
    
    /**
     * Constructor với ErrorCode và custom message
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     */
    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.details = new HashMap<>();
    }
    
    /**
     * Constructor với ErrorCode và cause
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param cause Exception gốc gây ra lỗi
     */
    public BusinessException(ErrorCode errorCode, Throwable cause) {
        super(errorCode.getMessage(), cause);
        this.errorCode = errorCode;
        this.details = new HashMap<>();
    }
    
    /**
     * Constructor với ErrorCode, custom message và cause
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     * @param cause Exception gốc gây ra lỗi
     */
    public BusinessException(ErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.details = new HashMap<>();
    }
    
    /**
     * Constructor với ErrorCode và details map
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param details Map chứa thông tin chi tiết về lỗi
     */
    public BusinessException(ErrorCode errorCode, Map<String, Object> details) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.details = details != null ? new HashMap<>(details) : new HashMap<>();
    }
    
    /**
     * Constructor đầy đủ với tất cả tham số
     * 
     * @param errorCode Mã lỗi từ ErrorCode enum
     * @param message Thông điệp lỗi tùy chỉnh
     * @param cause Exception gốc gây ra lỗi
     * @param details Map chứa thông tin chi tiết về lỗi
     */
    public BusinessException(ErrorCode errorCode, String message, Throwable cause, Map<String, Object> details) {
        super(message, cause);
        this.errorCode = errorCode;
        this.details = details != null ? new HashMap<>(details) : new HashMap<>();
    }
    
    /**
     * Lấy ErrorCode của exception
     * 
     * @return ErrorCode enum value
     */
    public ErrorCode getErrorCode() {
        return errorCode;
    }
    
    /**
     * Lấy details map
     * 
     * @return Map chứa thông tin chi tiết về lỗi
     */
    public Map<String, Object> getDetails() {
        return new HashMap<>(details);
    }
    
    /**
     * Thêm detail vào details map
     * 
     * @param key Key của detail
     * @param value Value của detail
     * @return BusinessException instance để support method chaining
     */
    public BusinessException addDetail(String key, Object value) {
        this.details.put(key, value);
        return this;
    }
    
    /**
     * Thêm nhiều details vào details map
     * 
     * @param additionalDetails Map chứa các details cần thêm
     * @return BusinessException instance để support method chaining
     */
    public BusinessException addDetails(Map<String, Object> additionalDetails) {
        if (additionalDetails != null) {
            this.details.putAll(additionalDetails);
        }
        return this;
    }
    
    /**
     * Kiểm tra xem có detail với key cụ thể không
     * 
     * @param key Key cần kiểm tra
     * @return true nếu có detail với key này
     */
    public boolean hasDetail(String key) {
        return details.containsKey(key);
    }
    
    /**
     * Lấy detail theo key
     * 
     * @param key Key của detail cần lấy
     * @return Value của detail hoặc null nếu không tồn tại
     */
    public Object getDetail(String key) {
        return details.get(key);
    }
    
    /**
     * Lấy detail theo key với type casting
     * 
     * @param <T> Type của detail
     * @param key Key của detail cần lấy
     * @param type Class type để cast
     * @return Value của detail đã được cast hoặc null nếu không tồn tại hoặc cast không thành công
     */
    @SuppressWarnings("unchecked")
    public <T> T getDetail(String key, Class<T> type) {
        Object value = details.get(key);
        if (value != null && type.isInstance(value)) {
            return (T) value;
        }
        return null;
    }
    
    /**
     * Xóa detail theo key
     * 
     * @param key Key của detail cần xóa
     * @return BusinessException instance để support method chaining
     */
    public BusinessException removeDetail(String key) {
        details.remove(key);
        return this;
    }
    
    /**
     * Xóa tất cả details
     * 
     * @return BusinessException instance để support method chaining
     */
    public BusinessException clearDetails() {
        details.clear();
        return this;
    }
    
    /**
     * Lấy số lượng details
     * 
     * @return Số lượng details trong map
     */
    public int getDetailsCount() {
        return details.size();
    }
    
    /**
     * Kiểm tra xem có details nào không
     * 
     * @return true nếu không có details nào
     */
    public boolean hasNoDetails() {
        return details.isEmpty();
    }
    
    @Override
    public String toString() {
        return String.format("BusinessException{errorCode=%s, message='%s', details=%s}", 
                           errorCode, getMessage(), details);
    }
}