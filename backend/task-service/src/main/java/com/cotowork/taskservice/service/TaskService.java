package com.cotowork.taskservice.service;

import com.cotowork.taskservice.dto.*;
import com.cotowork.taskservice.entity.Notification;
import com.cotowork.taskservice.entity.Task;
import com.cotowork.taskservice.entity.TaskPriority;
import com.cotowork.taskservice.entity.TaskStatus;
import com.cotowork.taskservice.repository.TaskRepository;
import com.cotowork.taskservice.security.JwtUserPrincipal;
import com.cotowork.taskservice.security.SecurityUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ============================================================
    // CALENDAR
    // ============================================================

    @Transactional(readOnly = true)
    public List<TaskResponseDto> getMyTasksInRange(LocalDate rangeStart, LocalDate rangeEnd) {
        JwtUserPrincipal me = getCurrentUser();
        log.info("Calendar: user {} fetching {} to {}", me.getUsername(), rangeStart, rangeEnd);

        List<Task> assigned = taskRepository.findByAssigneeAndDateRange(me.getUserId(), rangeStart, rangeEnd);
        List<Task> created = taskRepository.findByCreatorAndDateRange(me.getUserId(), rangeStart, rangeEnd);

        // Merge & deduplicate
        return Stream.concat(assigned.stream(), created.stream())
                .distinct()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskResponseDto> getAllTasksInRange(LocalDate rangeStart, LocalDate rangeEnd) {
        log.info("Calendar: fetching ALL tasks {} to {}", rangeStart, rangeEnd);
        return taskRepository.findAllInDateRange(rangeStart, rangeEnd)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskResponseDto> getUnitTasksInRange(Long unitId, LocalDate rangeStart, LocalDate rangeEnd) {
        log.info("Calendar: unit {} fetching {} to {}", unitId, rangeStart, rangeEnd);
        return taskRepository.findByUnitAndDateRange(unitId, rangeStart, rangeEnd)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // ============================================================
    // CRUD
    // ============================================================

    public TaskResponseDto createTask(TaskCreateDto dto) {
        JwtUserPrincipal me = getCurrentUser();
        log.info("Creating task '{}' by {}", dto.getTitle(), me.getUsername());

        Task task = Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .dueDate(dto.getDueDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .status(dto.getStatus() != null ? dto.getStatus() : TaskStatus.TODO)
                .priority(dto.getPriority() != null ? dto.getPriority() : TaskPriority.MEDIUM)
                .category(dto.getCategory() != null ? dto.getCategory() : "work")
                .isAllDay(dto.getIsAllDay() != null ? dto.getIsAllDay() : false)
                .location(dto.getLocation())
                // Creator = current user (từ JWT)
                .creatorId(me.getUserId())
                .creatorName(me.getUsername()) // Frontend có thể gửi fullName
                // Assignee
                .assigneeId(dto.getAssigneeId() != null ? dto.getAssigneeId() : me.getUserId())
                .assigneeName(dto.getAssigneeName() != null ? dto.getAssigneeName() : me.getUsername())
                // Unit
                .unitId(dto.getUnitId() != null ? dto.getUnitId() : me.getUnitId())
                .unitName(dto.getUnitName())
                .documentUrls(toJsonString(dto.getDocumentUrls()))
                .build();

        Task saved = taskRepository.save(task);
        log.info("Task created ID: {}", saved.getId());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public TaskResponseDto getTaskById(Long id) {
        Task task = findTaskOrThrow(id);
        return toDto(task);
    }

    public TaskResponseDto updateTask(Long id, TaskUpdateDto dto) {
        Task task = findTaskOrThrow(id);
        log.info("Updating task ID: {}", id);

        if (dto.getTitle() != null) task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getStartDate() != null) task.setStartDate(dto.getStartDate());
        if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());
        if (dto.getStartTime() != null) task.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null) task.setEndTime(dto.getEndTime());
        if (dto.getStatus() != null) task.setStatus(dto.getStatus());
        if (dto.getPriority() != null) task.setPriority(dto.getPriority());
        if (dto.getCategory() != null) task.setCategory(dto.getCategory());
        if (dto.getIsAllDay() != null) task.setIsAllDay(dto.getIsAllDay());
        if (dto.getLocation() != null) task.setLocation(dto.getLocation());
        if (dto.getAssigneeId() != null) task.setAssigneeId(dto.getAssigneeId());
        if (dto.getAssigneeName() != null) task.setAssigneeName(dto.getAssigneeName());
        if (dto.getUnitId() != null) task.setUnitId(dto.getUnitId());
        if (dto.getUnitName() != null) task.setUnitName(dto.getUnitName());
        if (dto.getDocumentUrls() != null) task.setDocumentUrls(toJsonString(dto.getDocumentUrls()));

        if (dto.getIsCompleted() != null) {
            task.setIsCompleted(dto.getIsCompleted());
            if (dto.getIsCompleted()) {
                task.setCompletedAt(LocalDateTime.now());
                task.setStatus(TaskStatus.COMPLETED);
            } else {
                task.setCompletedAt(null);
                if (task.getStatus() == TaskStatus.COMPLETED) task.setStatus(TaskStatus.TODO);
            }
        }

        Task saved = taskRepository.save(task);
        return toDto(saved);
    }

    public TaskResponseDto moveTask(Long id, TaskMoveDto dto) {
        Task task = findTaskOrThrow(id);
        log.info("Moving task {} to {}", id, dto.getNewStartDate());

        // Giữ duration khi move
        if (task.getStartDate() != null && task.getDueDate() != null) {
            long days = task.getDueDate().toEpochDay() - task.getStartDate().toEpochDay();
            task.setStartDate(dto.getNewStartDate());
            task.setDueDate(dto.getNewDueDate() != null ? dto.getNewDueDate() : dto.getNewStartDate().plusDays(days));
        } else {
            task.setStartDate(dto.getNewStartDate());
            task.setDueDate(dto.getNewDueDate() != null ? dto.getNewDueDate() : dto.getNewStartDate());
        }

        if (dto.getNewStartTime() != null) task.setStartTime(dto.getNewStartTime());
        if (dto.getNewEndTime() != null) task.setEndTime(dto.getNewEndTime());

        Task saved = taskRepository.save(task);
        return toDto(saved);
    }

    public TaskResponseDto toggleComplete(Long id) {
        Task task = findTaskOrThrow(id);
        boolean newState = !Boolean.TRUE.equals(task.getIsCompleted());
        task.setIsCompleted(newState);
        task.setCompletedAt(newState ? LocalDateTime.now() : null);
        task.setStatus(newState ? TaskStatus.COMPLETED : TaskStatus.TODO);

        Task saved = taskRepository.save(task);
        return toDto(saved);
    }

    public void deleteTask(Long id) {
        Task task = findTaskOrThrow(id);
        taskRepository.delete(task);
        log.info("Task deleted: {}", id);
    }

    @Transactional(readOnly = true)
    public List<TaskResponseDto> getOverdueTasks() {
        JwtUserPrincipal me = getCurrentUser();
        return taskRepository.findOverdueTasks(LocalDate.now()).stream()
                .filter(t -> me.getUserId().equals(t.getAssigneeId()) || me.getUserId().equals(t.getCreatorId()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<TaskResponseDto> getTasksWithFilters(TaskStatus status, TaskPriority priority,
                                                     Long assigneeId, Long unitId, Pageable pageable) {
        return taskRepository.findByFilters(status, priority, assigneeId, unitId, pageable).map(this::toDto);
    }

    // ============================================================
    // HELPERS
    // ============================================================

    private JwtUserPrincipal getCurrentUser() {
        return SecurityUtils.getCurrentPrincipal()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập"));
    }

    private Task findTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task không tồn tại: " + id));
    }

    private TaskResponseDto toDto(Task t) {
        return TaskResponseDto.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .startDate(t.getStartDate())
                .dueDate(t.getDueDate())
                .startTime(t.getStartTime())
                .endTime(t.getEndTime())
                .status(t.getStatus())
                .priority(t.getPriority())
                .category(t.getCategory())
                .isAllDay(t.getIsAllDay())
                .location(t.getLocation())
                .isCompleted(t.getIsCompleted())
                .completedAt(t.getCompletedAt())
                .assigneeId(t.getAssigneeId())
                .assigneeName(t.getAssigneeName())
                .creatorId(t.getCreatorId())
                .creatorName(t.getCreatorName())
                .unitId(t.getUnitId())
                .unitName(t.getUnitName())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .documentUrls(fromJsonString(t.getDocumentUrls()))
                .build();
    }


    public AssignTaskResponse assignTask(AssignTaskDto dto) {
        JwtUserPrincipal me = getCurrentUser();
        log.info("[AssignTask] '{}' assigning '{}' to assignees={} / unit={}",
                me.getUsername(), dto.getTitle(), dto.getAssigneeIds(), dto.getUnitId());

        List<Task> createdTasks = new ArrayList<>();

        boolean hasAssignees = dto.getAssigneeIds() != null && !dto.getAssigneeIds().isEmpty();

        if (hasAssignees) {
            // ── Giao cho từng người: tạo riêng 1 task ──────────────
            List<Long>   ids   = dto.getAssigneeIds();
            List<String> names = dto.getAssigneeNames() != null
                    ? dto.getAssigneeNames()
                    : Collections.nCopies(ids.size(), "");

            for (int i = 0; i < ids.size(); i++) {
                Long   assigneeId   = ids.get(i);
                String assigneeName = i < names.size() ? names.get(i) : "";

                Task task = buildTask(dto, me, assigneeId, assigneeName);
                createdTasks.add(taskRepository.save(task));
            }
        } else {
            // ── Giao cho cả phòng ban: 1 task chung ────────────────
            Task task = buildTask(dto, me, null, null);
            createdTasks.add(taskRepository.save(task));
        }

        // ── Gửi notification ────────────────────────────────────────
        int notifSent = 0;
        if (dto.isSendNotification()) {
            List<Long> recipientIds = resolveNotificationRecipients(dto, hasAssignees);

            if (!recipientIds.isEmpty()) {
                String message = dto.getNotificationMessage() != null
                        ? dto.getNotificationMessage()
                        : String.format("%s đã giao cho bạn công việc: \"%s\"",
                        me.getUsername(), dto.getTitle());

                // Gửi 1 notification cho tất cả cùng lúc
                Long firstTaskId = createdTasks.get(0).getId();
                SendNotificationRequest notifReq = SendNotificationRequest.builder()
                        .recipientIds(recipientIds)
                        .sendToAll(false)
                        .title("📋 Bạn có công việc mới")
                        .message(message)
                        .type(Notification.NotificationType.TASK_ASSIGNED)
                        .taskId(firstTaskId)
                        .taskTitle(dto.getTitle())
                        .build();

                try {
                    Map<String, Object> result = notificationService.sendNotification(notifReq);
                    notifSent = (int) result.getOrDefault("sentCount", 0);
                } catch (Exception e) {
                    log.warn("[AssignTask] Notification failed (non-critical): {}", e.getMessage());
                }
            }
        }

        List<TaskResponseDto> taskDtos = createdTasks.stream().map(this::toDto).collect(Collectors.toList());

        log.info("[AssignTask] Created {} task(s), sent {} notification(s)", createdTasks.size(), notifSent);

        return AssignTaskResponse.builder()
                .createdCount(createdTasks.size())
                .notificationSent(notifSent)
                .tasks(taskDtos)
                .message(String.format("Đã giao %d công việc và gửi %d thông báo", createdTasks.size(), notifSent))
                .build();
    }

    // ── Private helper: build Task entity từ AssignTaskDto ──────
    private Task buildTask(AssignTaskDto dto, JwtUserPrincipal creator,
                           Long assigneeId, String assigneeName) {
        return Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .dueDate(dto.getDueDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .status(dto.getStatus() != null ? dto.getStatus() : TaskStatus.TODO)
                .priority(dto.getPriority() != null ? dto.getPriority() : TaskPriority.MEDIUM)
                .category(dto.getCategory() != null ? dto.getCategory() : "work")
                .isAllDay(dto.getIsAllDay() != null ? dto.getIsAllDay() : false)
                .location(dto.getLocation())
                .creatorId(creator.getUserId())
                .creatorName(creator.getUsername())
                .assigneeId(assigneeId)
                .assigneeName(assigneeName)
                .unitId(dto.getUnitId())
                .unitName(dto.getUnitName())
                .documentUrls(toJsonString(dto.getDocumentUrls()))
                .build();
    }

    // ── Private helper: lấy danh sách recipient cho notification ─
    private List<Long> resolveNotificationRecipients(AssignTaskDto dto, boolean hasAssignees) {
        if (hasAssignees) {
            return dto.getAssigneeIds();
        }
        // Giao cho unit → notify từng thành viên nếu có
        if (dto.getUnitMemberIds() != null && !dto.getUnitMemberIds().isEmpty()) {
            return dto.getUnitMemberIds();
        }
        return Collections.emptyList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTaskStats(LocalDate from, LocalDate to) {
        LocalDate start = from != null ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate end   = to   != null ? to   : LocalDate.now();

        List<Task> all = taskRepository.findAllInDateRange(start, end);

        long total     = all.size();
        long completed = all.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long inProgress= all.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long todo      = all.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long review    = all.stream().filter(t -> t.getStatus() == TaskStatus.REVIEW).count();
        long cancelled = all.stream().filter(t -> t.getStatus() == TaskStatus.CANCELLED).count();
        long overdue   = all.stream().filter(t ->
                t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now())
                        && t.getStatus() != TaskStatus.COMPLETED
                        && t.getStatus() != TaskStatus.CANCELLED
        ).count();

        long urgent = all.stream().filter(t -> t.getPriority() == TaskPriority.URGENT).count();
        long high   = all.stream().filter(t -> t.getPriority() == TaskPriority.HIGH).count();
        long medium = all.stream().filter(t -> t.getPriority() == TaskPriority.MEDIUM).count();
        long low    = all.stream().filter(t -> t.getPriority() == TaskPriority.LOW).count();

        double rate = total > 0 ? Math.round((completed * 100.0 / total) * 10.0) / 10.0 : 0;

        return Map.of(
                "period",      Map.of("from", start.toString(), "to", end.toString()),
                "total",       total,
                "completed",   completed,
                "inProgress",  inProgress,
                "todo",        todo,
                "review",      review,
                "cancelled",   cancelled,
                "overdue",     overdue,
                "completionRate", rate,
                "byPriority",  Map.of("URGENT", urgent, "HIGH", high, "MEDIUM", medium, "LOW", low)
        );
    }

    private String toJsonString(List<String> list) {
        if (list == null || list.isEmpty()) return null;
        try { return objectMapper.writeValueAsString(list); }
        catch (Exception e) { return null; }
    }

    private List<String> fromJsonString(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try { return objectMapper.readValue(json, new TypeReference<List<String>>() {}); }
        catch (Exception e) { return Collections.emptyList(); }
    }


}