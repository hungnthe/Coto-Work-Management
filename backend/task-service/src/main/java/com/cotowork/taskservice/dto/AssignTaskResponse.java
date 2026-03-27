package com.cotowork.taskservice.dto;

import lombok.*;
import java.util.List;

/**
 * Kết quả trả về sau khi giao việc.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignTaskResponse {

    /** Số task đã tạo thành công */
    private int createdCount;

    /** Số notification đã gửi */
    private int notificationSent;

    /** Danh sách task vừa tạo */
    private List<TaskResponseDto> tasks;

    /** Thông báo tổng kết */
    private String message;
}