package com.cloudBackend.account.controller;

import com.cloudBackend.account.service.GoogleOAuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/oauth/google")
public class OAuthController {

    private final GoogleOAuthService oAuthService;

    public OAuthController(GoogleOAuthService oAuthService) {
        this.oAuthService = oAuthService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getOAuthStatus() {
        boolean configured = oAuthService.isConfigured();
        return ResponseEntity.ok(Map.of(
                "configured", configured,
                "provider", "GOOGLE_DRIVE",
                "message", configured ? "Google OAuth is ready" : "Google Client ID and Secret need to be configured in application.properties"
        ));
    }

    @GetMapping("/authorize-url")
    public ResponseEntity<Map<String, String>> getAuthorizeUrl(
            @RequestParam(value = "accountType", defaultValue = "personal") String accountType,
            HttpServletRequest request
    ) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            userId = 0L;
        }

        try {
            String url = oAuthService.generateAuthorizationUrl(userId, accountType);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> handleCallback(
            @RequestParam("code") String code,
            @RequestParam("state") String state
    ) {
        String redirectUrl = oAuthService.handleOAuthCallback(code, state);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(redirectUrl))
                .build();
    }
}
