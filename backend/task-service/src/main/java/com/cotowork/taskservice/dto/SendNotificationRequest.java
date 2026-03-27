package com.cotowork.taskservice.dto;

import com.cotowork.taskservice.entity.Notification.NotificationType;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendNotificationRequest {

    /** Danh sách ID người nhận. Để trống nếu sendToAll = true */
    private List<Long> recipientIds;

    /** true = gửi tất cả user (recipientIds bị bỏ qua) */
    private boolean sendToAll;

    private String title;
    private String message;
    private NotificationType type;

    // Task liên quan (tuỳ chọn - khi giao việc từ task)
    private Long taskId;
    private String taskTitle;
}