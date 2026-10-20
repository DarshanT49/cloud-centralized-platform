package com.cloudBackend.account.controller;

import com.cloudBackend.account.dto.ConnectedAccountDto;
import com.cloudBackend.account.service.GoogleDriveService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class ConnectedAccountController {

    private final GoogleDriveService googleDriveService;

    public ConnectedAccountController(GoogleDriveService googleDriveService) {
        this.googleDriveService = googleDriveService;
    }

    @GetMapping
    public ResponseEntity<List<ConnectedAccountDto>> getConnectedAccounts(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.emptyList());
        }

        List<ConnectedAccountDto> accounts = googleDriveService.getConnectedAccounts(userId);
        return ResponseEntity.ok(accounts);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> unlinkAccount(
            @PathVariable("id") Long accountId,
            HttpServletRequest request
    ) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Unauthorized"));
        }

        googleDriveService.unlinkAccount(userId, accountId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Account unlinked successfully."));
    }
}
