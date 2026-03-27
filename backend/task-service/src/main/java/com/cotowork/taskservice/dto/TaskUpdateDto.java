package com.cotowork.taskservice.dto;

import com.cotowork.taskservice.entity.TaskPriority;
import com.cotowork.taskservice.entity.TaskStatus;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TaskUpdateDto {

    @Size(max = 300)
    private String title;

    @Size(max = 2000)
    private String description;

    private LocalDate startDate;
    private LocalDate dueDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private TaskStatus status;
    private TaskPriority priority;
    private String category;
    private Long assigneeId;
    private String assigneeName;
    private Long unitId;
    private String unitName;
    private Boolean isAllDay;

    @Size(max = 200)
    private String location;

    private Boolean isCompleted;
    private List<String> documentUrls;

}