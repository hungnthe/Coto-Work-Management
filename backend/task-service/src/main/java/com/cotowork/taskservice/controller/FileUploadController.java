package com.cotowork.taskservice.controller;

import com.cotowork.taskservice.security.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

/**
 * File upload endpoint — gộp vào task-service để tiết kiệm tài nguyên.
 * Files lưu tại: /app/uploads/{userId}/{uuid}_{filename}
 * URL trả về:    /api/files/{userId}/{uuid}_{filename}
 */
@RestController
@RequestMapping("/api/files")
@Slf4j
public class FileUploadController {

    @Value("${file.upload-dir:/app/uploads}")
    private String uploadDir;

    @Value("${file.max-size-mb:20}")
    private long maxSizeMb;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain",
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "application/zip", "application/x-zip-compressed"
    );

    /**
     * POST /api/files/upload
     * Upload 1 hoặc nhiều file, trả về danh sách URL.
     */
    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> uploadFiles(
            @RequestParam("files") MultipartFile[] files) {

        Long userId = SecurityUtils.getCurrentPrincipal()
                .map(p -> p.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        if (files == null || files.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không có file nào được gửi");
        }
        if (files.length > 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tối đa 10 file mỗi lần upload");
        }

        List<Map<String, String>> uploaded = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                // Validate size
                long maxBytes = maxSizeMb * 1024 * 1024;
                if (file.getSize() > maxBytes) {
                    errors.add(file.getOriginalFilename() + ": vượt quá " + maxSizeMb + "MB");
                    continue;
                }

                // Validate type
                String contentType = file.getContentType() != null ? file.getContentType() : "";
                if (!ALLOWED_TYPES.contains(contentType)) {
                    errors.add(file.getOriginalFilename() + ": định dạng không được phép");
                    continue;
                }

                // Sanitize filename
                String originalName = sanitize(file.getOriginalFilename());
                String storedName   = UUID.randomUUID().toString().replace("-", "") + "_" + originalName;

                // Create user dir
                Path userDir = Paths.get(uploadDir, String.valueOf(userId));
                Files.createDirectories(userDir);

                // Save
                Path dest = userDir.resolve(storedName);
                Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

                String url = "/api/files/" + userId + "/" + storedName;
                uploaded.add(Map.of(
                        "name", originalName,
                        "url",  url,
                        "size", String.valueOf(file.getSize()),
                        "type", contentType
                ));

                log.info("[Upload] userId={} file={} size={}KB", userId, storedName, file.getSize()/1024);

            } catch (IOException e) {
                log.error("[Upload] Error saving file: {}", e.getMessage());
                errors.add(file.getOriginalFilename() + ": lỗi lưu file");
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("uploaded", uploaded);
        result.put("urls", uploaded.stream().map(m -> m.get("url")).toList());
        result.put("count", uploaded.size());
        if (!errors.isEmpty()) result.put("errors", errors);

        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/files/{userId}/{filename}
     * Serve file đã upload.
     */
    @GetMapping("/{userId}/{filename}")
    public ResponseEntity<byte[]> serveFile(
            @PathVariable String userId,
            @PathVariable String filename) {

        try {
            Path file = Paths.get(uploadDir, userId, sanitize(filename));
            if (!Files.exists(file)) {
                return ResponseEntity.notFound().build();
            }

            byte[] content = Files.readAllBytes(file);
            String mimeType = Files.probeContentType(file);
            if (mimeType == null) mimeType = "application/octet-stream";

            return ResponseEntity.ok()
                    .header("Content-Type", mimeType)
                    .header("Content-Disposition", "inline; filename=\"" + filename.replaceAll("^[a-f0-9]+_", "") + "\"")
                    .header("Cache-Control", "public, max-age=86400")
                    .body(content);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * DELETE /api/files/{userId}/{filename}
     */
    @DeleteMapping("/{userId}/{filename}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteFile(
            @PathVariable String userId,
            @PathVariable String filename) {

        Long currentUserId = SecurityUtils.getCurrentPrincipal()
                .map(p -> p.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        // Chỉ cho xóa file của chính mình (trừ ADMIN)
        if (!String.valueOf(currentUserId).equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền xóa file này");
        }

        try {
            Path file = Paths.get(uploadDir, userId, sanitize(filename));
            Files.deleteIfExists(file);
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String sanitize(String filename) {
        if (filename == null) return "file";
        // Xóa path traversal characters
        return filename.replaceAll("[/\\\\:*?\"<>|]", "_").trim();
    }
}