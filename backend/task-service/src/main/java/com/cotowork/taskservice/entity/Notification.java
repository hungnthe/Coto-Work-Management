package com.cotowork.taskservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Người nhận
    @Column(name = "recipient_id", nullable = false)
    private Long recipientId;

    @Column(name = "recipient_name")
    private String recipientName;

    // Người gửi
    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(name = "sender_name")
    private String senderName;

    // Nội dung
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    // Task liên quan (tuỳ chọn)
    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "task_title")
    private String taskTitle;

    // Trạng thái
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum NotificationType {
        TASK_ASSIGNED,
        TASK_UPDATED,
        TASK_DUE_SOON,
        TASK_OVERDUE,
        GENERAL
    }
}