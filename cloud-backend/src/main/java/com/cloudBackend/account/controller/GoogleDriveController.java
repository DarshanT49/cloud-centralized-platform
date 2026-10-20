package com.cloudBackend.account.controller;

import com.cloudBackend.account.dto.DriveFileDto;
import com.cloudBackend.account.service.GoogleDriveService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/drive")
public class GoogleDriveController {

    private final GoogleDriveService googleDriveService;

    public GoogleDriveController(GoogleDriveService googleDriveService) {
        this.googleDriveService = googleDriveService;
    }

    @GetMapping("/files")
    public ResponseEntity<?> getFiles(
            @RequestParam(value = "accountId", required = false, defaultValue = "all") String accountId,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "starred", required = false) Boolean starred,
            @RequestParam(value = "trashed", required = false) Boolean trashed,
            HttpServletRequest request
    ) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.emptyList());
        }

        GoogleDriveService.DriveFilesResult result = googleDriveService.getFilesResult(userId, accountId, search, starred, trashed);
        if (result.isApiDisabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of(
                    "error", "SERVICE_DISABLED",
                    "message", "Google Drive API has not been activated in project. Please enable it in Google Cloud Console.",
                    "activationUrl", result.getActivationUrl(),
                    "files", Collections.emptyList()
            ));
        }
        if (result.isNeedsReauth()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of(
                    "error", "NEEDS_REAUTH",
                    "needsReauth", true,
                    "message", result.getErrorMessage() != null ? result.getErrorMessage() : "Google Drive file permission not granted. Please re-authorize Drive access.",
                    "files", Collections.emptyList()
            ));
        }

        return ResponseEntity.ok(result.getFiles());
    }

    @PostMapping(value = "/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "accountId", required = false) Long accountId,
            @RequestParam(value = "folderId", required = false) String folderId,
            HttpServletRequest request
    ) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("error", "Unauthorized"));
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "No file selected"));
        }

        try {
            DriveFileDto uploaded = googleDriveService.uploadFile(userId, accountId, file, folderId);
            return ResponseEntity.ok(uploaded);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", e.getMessage() != null ? e.getMessage() : "Upload failed"));
        }
    }

    @PostMapping("/folders")
    public ResponseEntity<?> createFolder(
            @RequestBody java.util.Map<String, Object> body,
            HttpServletRequest request
    ) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("error", "Unauthorized"));
        }

        String name = (String) body.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Folder name is required"));
        }

        Long accountId = null;
        if (body.get("accountId") != null) {
            try {
                accountId = Long.valueOf(body.get("accountId").toString().replace("google-", ""));
            } catch (Exception ignored) {}
        }
        String parentFolderId = (String) body.get("parentFolderId");

        try {
            DriveFileDto folder = googleDriveService.createFolder(userId, accountId, name, parentFolderId);
            return ResponseEntity.status(HttpStatus.CREATED).body(folder);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", e.getMessage() != null ? e.getMessage() : "Folder creation failed"));
        }
    }
}
