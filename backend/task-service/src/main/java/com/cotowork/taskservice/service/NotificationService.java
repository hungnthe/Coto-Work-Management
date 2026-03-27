package com.cotowork.taskservice.service;

import com.cotowork.taskservice.dto.NotificationResponse;
import com.cotowork.taskservice.dto.SendNotificationRequest;
import com.cotowork.taskservice.entity.Notification;
import com.cotowork.taskservice.entity.Notification.NotificationType;
import com.cotowork.taskservice.repository.NotificationRepository;
import com.cotowork.taskservice.security.JwtUserPrincipal;
import com.cotowork.taskservice.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ============================================================
    // ADMIN / UNIT_MANAGER: Gửi thông báo đến nhiều user
    // POST /api/notifications/send
    // ============================================================

    public Map<String, Object> sendNotification(SendNotificationRequest req) {
        // Dùng đúng SecurityUtils của project - lấy từ request.getAttribute("userDetails")
        JwtUserPrincipal me = getCurrentUser();

        if (req.isSendToAll()) {
            throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED,
                    "sendToAll cần inject UserServiceClient. Dùng recipientIds cụ thể.");
            /*
             * TODO khi cần sendToAll:
             * Inject RestTemplate hoặc WebClient gọi:
             *   GET http://user-service/api/users/ids-active
             * rồi lấy danh sách Long userId, lọc bỏ me.getUserId()
             */
        }

        List<Long> recipientIds = req.getRecipientIds();
        if (recipientIds == null || recipientIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh sách người nhận không được rỗng");
        }

        // Lọc bỏ chính mình
        List<Long> validRecipients = recipientIds.stream()
                .filter(id -> !id.equals(me.getUserId()))
                .distinct()
                .collect(Collectors.toList());

        if (validRecipients.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không có người nhận hợp lệ");
        }

        NotificationType type = req.getType() != null ? req.getType() : NotificationType.TASK_ASSIGNED;

        // JwtUserPrincipal của project dùng username (không có fullName)
        List<Notification> notifications = validRecipients.stream()
                .map(recipientId -> Notification.builder()
                        .recipientId(recipientId)
                        .senderId(me.getUserId())
                        .senderName(me.getUsername())   // ← dùng username vì JwtUserPrincipal không có fullName
                        .title(req.getTitle())
                        .message(req.getMessage())
                        .type(type)
                        .taskId(req.getTaskId())
                        .taskTitle(req.getTaskTitle())
                        .isRead(false)
                        .build())
                .collect(Collectors.toList());

        List<Notification> saved = notificationRepository.saveAll(notifications);

        // Push WebSocket real-time đến từng người nhận
        saved.forEach(this::pushWebSocket);

        log.info("[Notification] '{}' sent '{}' ({}) to {} users",
                me.getUsername(), req.getTitle(), type, saved.size());

        return Map.of("success", true, "sentCount", saved.size());
    }

    // ============================================================
    // USER: Lấy thông báo của mình
    // GET /api/notifications?page=0&size=20
    // ============================================================

    @Transactional(readOnly = true)
    public Map<String, Object> getMyNotifications(int page, int size) {
        Long userId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<Notification> pageResult =
                notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, pageable);

        return Map.of(
                "notifications",  pageResult.getContent().stream()
                        .map(NotificationResponse::from)
                        .collect(Collectors.toList()),
                "totalUnread",    notificationRepository.countByRecipientIdAndIsReadFalse(userId),
                "totalElements",  pageResult.getTotalElements(),
                "totalPages",     pageResult.getTotalPages(),
                "currentPage",    page
        );
    }

    // ============================================================
    // USER: Số badge chưa đọc
    // GET /api/notifications/unread-count
    // ============================================================

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return notificationRepository.countByRecipientIdAndIsReadFalse(getCurrentUserId());
    }

    // ============================================================
    // USER: Đánh dấu 1 thông báo đã đọc
    // PATCH /api/notifications/{id}/read
    // ============================================================

    public Map<String, Object> markAsRead(Long notificationId) {
        Long userId = getCurrentUserId();
        int updated = notificationRepository.markAsRead(notificationId, userId);
        long remaining = notificationRepository.countByRecipientIdAndIsReadFalse(userId);
        return Map.of("success", updated > 0, "unreadCount", remaining);
    }

    // ============================================================
    // USER: Đánh dấu tất cả đã đọc
    // PATCH /api/notifications/read-all
    // ============================================================

    public Map<String, Object> markAllAsRead() {
        Long userId = getCurrentUserId();
        int updated = notificationRepository.markAllAsRead(userId);
        return Map.of("success", true, "markedCount", updated, "unreadCount", 0L);
    }

    // ============================================================
    // INTERNAL: Push WebSocket đến user cụ thể
    // ============================================================

    private void pushWebSocket(Notification n) {
        try {
            long unreadCount = notificationRepository.countByRecipientIdAndIsReadFalse(n.getRecipientId());

            Map<String, Object> payload = new HashMap<>();
            payload.put("id",          n.getId());
            payload.put("title",       n.getTitle());
            payload.put("message",     n.getMessage() != null ? n.getMessage() : "");
            payload.put("type",        n.getType().name());
            payload.put("senderName",  n.getSenderName());
            payload.put("taskId",      n.getTaskId());
            payload.put("taskTitle",   n.getTaskTitle() != null ? n.getTaskTitle() : "");
            payload.put("createdAt",   n.getCreatedAt().toString());
            payload.put("unreadCount", unreadCount);

            // Destination: /user/{recipientId}/queue/notifications
            messagingTemplate.convertAndSendToUser(
                    n.getRecipientId().toString(),
                    "/queue/notifications",
                    payload
            );

            log.debug("[WS] Pushed to userId={}: {}", n.getRecipientId(), n.getTitle());

        } catch (Exception e) {
            log.error("[WS] Push failed userId={}: {}", n.getRecipientId(), e.getMessage());
        }
    }

    // ============================================================
    // HELPERS - dùng đúng SecurityUtils của project
    // ============================================================

    private JwtUserPrincipal getCurrentUser() {
        // SecurityUtils lấy từ request.getAttribute("userDetails") - set bởi JwtAuthenticationFilter
        return SecurityUtils.getCurrentPrincipal()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập"));
    }

    private Long getCurrentUserId() {
        return getCurrentUser().getUserId();
    }
}