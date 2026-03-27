package com.cotowork.taskservice.dto;

import com.cotowork.taskservice.entity.TaskPriority;
import com.cotowork.taskservice.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * DTO để giao việc từ Admin/Manager tới nhiều người hoặc cả phòng ban.
 *
 * Luồng:
 *  - assigneeIds có giá trị  → tạo 1 task riêng cho từng người + gửi notification
 *  - assigneeIds rỗng/null   → tạo 1 task chung cho unitId (phòng ban) + gửi notification tới unitMemberIds nếu có
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignTaskDto {

    // ── Thông tin task ──────────────────────────────────────────
    @NotBlank(message = "Tiêu đề là bắt buộc")
    @Size(max = 300)
    private String title;

    @Size(max = 2000)
    private String description;

    private LocalDate startDate;
    private LocalDate dueDate;
    private LocalTime startTime;
    private LocalTime endTime;

    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Builder.Default
    private String category = "work";

    private Boolean isAllDay;

    @Size(max = 200)
    private String location;

    // ── Giao cho ai ─────────────────────────────────────────────

    /**
     * Giao cho nhiều người cụ thể.
     * Mỗi phần tử tương ứng với assigneeNames (cùng index).
     * Nếu để trống → giao theo unitId.
     */
    private List<Long> assigneeIds;

    /**
     * Tên cache của từng assignee (cùng index với assigneeIds).
     */
    private List<String> assigneeNames;

    /**
     * Giao cho cả phòng ban (dùng khi assigneeIds rỗng).
     */
    private Long unitId;
    private String unitName;

    /**
     * Danh sách userId của thành viên phòng ban — dùng để gửi notification.
     * Không bắt buộc; nếu null thì không gửi notification unit-wide.
     */
    private List<Long> unitMemberIds;

    // ── Notification ────────────────────────────────────────────

    /**
     * true (mặc định) = gửi notification TASK_ASSIGNED đến người được giao.
     */
    @Builder.Default
    private boolean sendNotification = true;

    /**
     * Nội dung tùy chỉnh của notification. Nếu null thì dùng message mặc định.
     */
    private String notificationMessage;
    private List<String> documentUrls;
}