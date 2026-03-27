package com.cotowork.taskservice.controller;

import com.cotowork.taskservice.dto.*;
import com.cotowork.taskservice.entity.TaskPriority;
import com.cotowork.taskservice.entity.TaskStatus;
import com.cotowork.taskservice.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Tasks & Calendar", description = "Quản lý công việc và lịch biểu")
public class TaskController {

    private final TaskService taskService;

    // ============================================================
    // CALENDAR
    // ============================================================

    @Operation(summary = "Lịch cá nhân")
    @GetMapping("/calendar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TaskResponseDto>> getMyCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(taskService.getMyTasksInRange(start, end));
    }

    @Operation(summary = "Lịch toàn bộ (Admin)")
    @GetMapping("/calendar/all")
    @PreAuthorize("hasAuthority('task:manage_all')")
    public ResponseEntity<List<TaskResponseDto>> getAllCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(taskService.getAllTasksInRange(start, end));
    }

    @Operation(summary = "Lịch theo đơn vị")
    @GetMapping("/calendar/unit/{unitId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TaskResponseDto>> getUnitCalendar(
            @PathVariable Long unitId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(taskService.getUnitTasksInRange(unitId, start, end));
    }

    // ============================================================
    // CRUD
    // ============================================================

    @Operation(summary = "Tạo công việc")
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TaskResponseDto> createTask(@Valid @RequestBody TaskCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(dto));
    }

    @Operation(summary = "Chi tiết công việc")
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TaskResponseDto> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @Operation(summary = "Cập nhật công việc")
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TaskResponseDto> updateTask(@PathVariable Long id, @Valid @RequestBody TaskUpdateDto dto) {
        return ResponseEntity.ok(taskService.updateTask(id, dto));
    }

    @Operation(summary = "Di chuyển (kéo thả Calendar)")
    @PatchMapping("/{id}/move")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TaskResponseDto> moveTask(@PathVariable Long id, @Valid @RequestBody TaskMoveDto dto) {
        return ResponseEntity.ok(taskService.moveTask(id, dto));
    }

    @Operation(summary = "Đánh dấu hoàn thành / chưa")
    @PatchMapping("/{id}/toggle-complete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TaskResponseDto> toggleComplete(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.toggleComplete(id));
    }

    @Operation(summary = "Xóa công việc")
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Công việc quá hạn")
    @GetMapping("/overdue")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TaskResponseDto>> getOverdueTasks() {
        return ResponseEntity.ok(taskService.getOverdueTasks());
    }

    @Operation(summary = "Danh sách có lọc + phân trang")
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<TaskResponseDto>> getTasks(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) Long unitId,
            Pageable pageable) {
        return ResponseEntity.ok(taskService.getTasksWithFilters(status, priority, assigneeId, unitId, pageable));
    }

    // ============================================================
    // HEALTH
    // ============================================================

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("task-service is healthy");
    }

    // ============================================================
    // ASSIGN TASK —  (Admin / Unit Manager)
    // ============================================================

    @Operation(summary = "Giao việc cho nhiều người hoặc cả phòng ban")
    @PostMapping("/assign")
    @PreAuthorize("hasAnyAuthority('task:manage_all', 'task:assign')")
    public ResponseEntity<AssignTaskResponse> assignTask(
            @Valid @RequestBody AssignTaskDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.assignTask(dto));
    }

    @Operation(summary = "Thống kê task theo tháng")
    @GetMapping("/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getTaskStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(taskService.getTaskStats(from, to));
    }
}