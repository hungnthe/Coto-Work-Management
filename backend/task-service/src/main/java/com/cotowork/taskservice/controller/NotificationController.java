package com.cotowork.taskservice.controller;

import com.cotowork.taskservice.dto.SendNotificationRequest;
import com.cotowork.taskservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // ----------------------------------------------------------------
    // ADMIN / UNIT_MANAGER: Gửi thông báo
    // POST /api/notifications/send
    // Body: { "recipientIds": [2, 3], "title": "...", "message": "...",
    //         "type": "TASK_ASSIGNED", "taskId": 5, "taskTitle": "..." }
    // ----------------------------------------------------------------
    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'UNIT_MANAGER')")
    public ResponseEntity<Map<String, Object>> send(@RequestBody SendNotificationRequest req) {
        return ResponseEntity.ok(notificationService.sendNotification(req));
    }

    // ----------------------------------------------------------------
    // USER: Lấy thông báo của mình (phân trang)
    // GET /api/notifications?page=0&size=20
    // ----------------------------------------------------------------
    @GetMapping
    public ResponseEntity<Map<String, Object>> getMyNotifications(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(notificationService.getMyNotifications(page, size));
    }

    // ----------------------------------------------------------------
    // USER: Badge - số chưa đọc
    // GET /api/notifications/unread-count
    // ----------------------------------------------------------------
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> unreadCount() {
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount()));
    }

    // ----------------------------------------------------------------
    // USER: Đọc 1 thông báo
    // PATCH /api/notifications/{id}/read
    // ----------------------------------------------------------------
    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    // ----------------------------------------------------------------
    // USER: Đọc tất cả
    // PATCH /api/notifications/read-all
    // ----------------------------------------------------------------
    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        return ResponseEntity.ok(notificationService.markAllAsRead());
    }
}