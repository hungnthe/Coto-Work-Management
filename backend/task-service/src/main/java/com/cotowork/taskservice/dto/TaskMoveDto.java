package com.cotowork.taskservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TaskMoveDto {

    @NotNull(message = "Ngày mới là bắt buộc")
    private LocalDate newStartDate;

    private LocalDate newDueDate;
    private LocalTime newStartTime;
    private LocalTime newEndTime;
}