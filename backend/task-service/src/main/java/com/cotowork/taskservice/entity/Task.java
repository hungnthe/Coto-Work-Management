package com.cotowork.taskservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "tasks", indexes = {
        @Index(name = "idx_task_assignee", columnList = "assignee_id"),
        @Index(name = "idx_task_creator", columnList = "creator_id"),
        @Index(name = "idx_task_due_date", columnList = "due_date"),
        @Index(name = "idx_task_status", columnList = "status"),
        @Index(name = "idx_task_unit", columnList = "unit_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(length = 2000)
    private String description;

    // ---- Dates ----
    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    // ---- Status & Priority ----
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;

    // ---- Category ----
    @Column(length = 20)
    @Builder.Default
    private String category = "work";

    // ---- Microservice pattern: lưu ID thay vì FK ----
    // KHÔNG dùng @ManyToOne vì User nằm ở DB khác (user-service)
    @Column(name = "assignee_id")
    private Long assigneeId;

    @Column(name = "assignee_name", length = 100)
    private String assigneeName; // Cache tên để hiển thị không cần gọi user-service

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    @Column(name = "creator_name", length = 100)
    private String creatorName;

    @Column(name = "unit_id")
    private Long unitId;

    @Column(name = "unit_name", length = 200)
    private String unitName;

    // ---- Metadata ----
    @Column(nullable = false)
    @Builder.Default
    private Boolean isAllDay = false;

    @Column(length = 200)
    private String location;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isCompleted = false;

    @Column
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "document_urls", columnDefinition = "TEXT")
    private String documentUrls;
}