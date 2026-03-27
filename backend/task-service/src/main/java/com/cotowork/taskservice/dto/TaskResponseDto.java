package com.cotowork.taskservice.dto;

import com.cotowork.taskservice.entity.TaskPriority;
import com.cotowork.taskservice.entity.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TaskResponseDto {

    private Long id;
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate dueDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private TaskStatus status;
    private TaskPriority priority;
    private String category;
    private Boolean isAllDay;
    private String location;
    private Boolean isCompleted;
    private LocalDateTime completedAt;

    // User info (cached in task-service, không cần gọi user-service)
    private Long assigneeId;
    private String assigneeName;
    private Long creatorId;
    private String creatorName;
    private Long unitId;
    private String unitName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> documentUrls;

}