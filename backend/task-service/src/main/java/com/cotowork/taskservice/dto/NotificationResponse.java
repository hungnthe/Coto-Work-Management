package com.cotowork.taskservice.dto;

import com.cotowork.taskservice.entity.Notification;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long id;
    private Long senderId;
    private String senderName;
    private String title;
    private String message;
    private String type;
    private Long taskId;
    private String taskTitle;
    private boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;

    public static NotificationResponse from(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .senderId(n.getSenderId())
                .senderName(n.getSenderName())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType().name())
                .taskId(n.getTaskId())
                .taskTitle(n.getTaskTitle())
                .isRead(n.isRead())
                .readAt(n.getReadAt())
                .createdAt(n.getCreatedAt())
                .build();
    }
}