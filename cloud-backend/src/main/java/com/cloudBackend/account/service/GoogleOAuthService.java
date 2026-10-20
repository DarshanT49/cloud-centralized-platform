package com.cloudBackend.account.service;

import com.cloudBackend.account.entity.ConnectedAccount;
import com.cloudBackend.account.repository.ConnectedAccountRepository;
import com.cloudBackend.auth.entity.User;
import com.cloudBackend.auth.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
public class GoogleOAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuthService.class);

    @Value("${google.oauth.client-id:YOUR_GOOGLE_CLIENT_ID}")
    private String clientId;

    @Value("${google.oauth.client-secret:YOUR_GOOGLE_CLIENT_SECRET}")
    private String clientSecret;

    @Value("${google.oauth.redirect-uri:http://localhost:8080/api/oauth/google/callback}")
    private String redirectUri;

    @Value("${google.oauth.frontend-url:http://localhost:5173/dashboard}")
    private String frontendUrl;

    private final ConnectedAccountRepository accountRepository;
    private final UserRepository userRepository;
    private final com.cloudBackend.config.security.JwtService jwtService;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GoogleOAuthService(
            ConnectedAccountRepository accountRepository,
            UserRepository userRepository,
            com.cloudBackend.config.security.JwtService jwtService,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder
    ) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newHttpClient();
    }

    public boolean isConfigured() {
        return clientId != null && !clientId.isBlank() && !clientId.equals("YOUR_GOOGLE_CLIENT_ID")
                && clientSecret != null && !clientSecret.isBlank() && !clientSecret.equals("YOUR_GOOGLE_CLIENT_SECRET");
    }

    public String generateAuthorizationUrl(Long userId, String accountType) {
        if (!isConfigured()) {
            throw new IllegalStateException("Google OAuth credentials are not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in application.properties or environment variables.");
        }

        Long effectiveUserId = userId != null ? userId : 0L;
        String rawState = effectiveUserId + ":" + (accountType != null ? accountType : "personal") + ":" + System.currentTimeMillis();
        String state = Base64.getUrlEncoder().encodeToString(rawState.getBytes(StandardCharsets.UTF_8));

        String scopes = "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";

        return "https://accounts.google.com/o/oauth2/v2/auth?"
                + "client_id=" + URLEncoder.encode(clientId, StandardCharsets.UTF_8)
                + "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8)
                + "&response_type=code"
                + "&scope=" + URLEncoder.encode(scopes, StandardCharsets.UTF_8)
                + "&access_type=offline"
                + "&prompt=consent"
                + "&include_granted_scopes=true"
                + "&state=" + URLEncoder.encode(state, StandardCharsets.UTF_8);
    }

    @Transactional
    public String handleOAuthCallback(String code, String state) {
        try {
            // Decode state parameter
            String decodedState = new String(Base64.getUrlDecoder().decode(state), StandardCharsets.UTF_8);
            String[] parts = decodedState.split(":");
            if (parts.length < 2) {
                throw new IllegalArgumentException("Invalid OAuth state format.");
            }

            Long requestedUserId = Long.parseLong(parts[0]);
            String accountType = parts[1];

            // 1. Exchange authorization code for tokens
            String tokenRequestBody = "code=" + URLEncoder.encode(code, StandardCharsets.UTF_8)
                    + "&client_id=" + URLEncoder.encode(clientId, StandardCharsets.UTF_8)
                    + "&client_secret=" + URLEncoder.encode(clientSecret, StandardCharsets.UTF_8)
                    + "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8)
                    + "&grant_type=authorization_code";

            HttpRequest tokenRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://oauth2.googleapis.com/token"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(tokenRequestBody))
                    .build();

            HttpResponse<String> tokenResponse = httpClient.send(tokenRequest, HttpResponse.BodyHandlers.ofString());

            if (tokenResponse.statusCode() != 200) {
                log.error("Failed to exchange Google OAuth code: {}", tokenResponse.body());
                return frontendUrl + "?error=" + URLEncoder.encode("Google OAuth token exchange failed", StandardCharsets.UTF_8);
            }

            JsonNode tokenJson = objectMapper.readTree(tokenResponse.body());
            String accessToken = tokenJson.path("access_token").asText();
            String refreshToken = tokenJson.path("refresh_token").asText(null);
            int expiresIn = tokenJson.path("expires_in").asInt(3600);

            // 2. Fetch Google User Profile
            HttpRequest profileRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://www.googleapis.com/oauth2/v3/userinfo"))
                    .header("Authorization", "Bearer " + accessToken)
                    .GET()
                    .build();

            HttpResponse<String> profileResponse = httpClient.send(profileRequest, HttpResponse.BodyHandlers.ofString());
            JsonNode profileJson = objectMapper.readTree(profileResponse.body());

            String googleEmail = profileJson.path("email").asText().toLowerCase().trim();
            String googleName = profileJson.path("name").asText();
            String googlePicture = profileJson.path("picture").asText(null);

            // 3. User Resolution: lookup by ID or find/create by Google email
            User user = null;
            if (requestedUserId != null && requestedUserId > 0) {
                user = userRepository.findById(requestedUserId).orElse(null);
            }

            if (user == null) {
                user = userRepository.findByEmail(googleEmail).orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(googleEmail);
                    newUser.setFullName(googleName != null && !googleName.isBlank() ? googleName : googleEmail.split("@")[0]);
                    newUser.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
                    newUser.setRole("ROLE_USER");
                    return userRepository.save(newUser);
                });
            }

            // 4. Fetch Google Drive Storage Quota
            long storageUsed = 0L;
            long storageLimit = 15L * 1024 * 1024 * 1024; // fallback 15 GB

            try {
                HttpRequest driveAboutRequest = HttpRequest.newBuilder()
                        .uri(URI.create("https://www.googleapis.com/drive/v3/about?fields=storageQuota,user"))
                        .header("Authorization", "Bearer " + accessToken)
                        .GET()
                        .build();

                HttpResponse<String> driveAboutResponse = httpClient.send(driveAboutRequest, HttpResponse.BodyHandlers.ofString());
                if (driveAboutResponse.statusCode() == 200) {
                    JsonNode aboutJson = objectMapper.readTree(driveAboutResponse.body());
                    JsonNode quotaNode = aboutJson.path("storageQuota");
                    if (!quotaNode.isMissingNode()) {
                        storageUsed = quotaNode.path("usage").asLong(0L);
                        long limit = quotaNode.path("limit").asLong(0L);
                        if (limit > 0) {
                            storageLimit = limit;
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Could not query Google Drive storage quota directly: {}", e.getMessage());
            }

            // 5. Save or Update ConnectedAccount
            final User targetUser = user;
            Optional<ConnectedAccount> existingOpt = accountRepository.findByUserIdAndAccountEmail(targetUser.getId(), googleEmail);
            ConnectedAccount account = existingOpt.orElseGet(() -> {
                ConnectedAccount newAcc = new ConnectedAccount();
                newAcc.setUser(targetUser);
                newAcc.setAccountEmail(googleEmail);
                newAcc.setProvider("GOOGLE_DRIVE");
                return newAcc;
            });

            account.setAccountName(googleName != null && !googleName.isBlank() ? googleName : (googleEmail.split("@")[0] + " Drive"));
            account.setAccountType(accountType);
            account.setAvatarUrl(googlePicture);
            account.setAccessToken(accessToken);
            if (refreshToken != null && !refreshToken.isBlank()) {
                account.setRefreshToken(refreshToken);
            }
            account.setTokenExpiresAt(LocalDateTime.now().plusSeconds(expiresIn));
            account.setStorageUsed(storageUsed);
            account.setStorageLimit(storageLimit);
            account.setSyncStatus("SYNCED");

            accountRepository.save(account);

            // 6. Generate fresh JWT token for seamless auto-login
            String jwtToken = jwtService.generateToken(user);

            return frontendUrl + "?token=" + URLEncoder.encode(jwtToken, StandardCharsets.UTF_8)
                    + "&connected=success&email=" + URLEncoder.encode(googleEmail, StandardCharsets.UTF_8);

        } catch (Exception e) {
            log.error("Error processing Google OAuth callback: ", e);
            return frontendUrl + "?error=" + URLEncoder.encode(e.getMessage() != null ? e.getMessage() : "Unknown error", StandardCharsets.UTF_8);
        }
    }

    public String refreshAccessToken(ConnectedAccount account) {
        if (account.getRefreshToken() == null || account.getRefreshToken().isBlank()) {
            throw new IllegalStateException("No refresh token available for account: " + account.getAccountEmail());
        }

        try {
            String requestBody = "client_id=" + URLEncoder.encode(clientId, StandardCharsets.UTF_8)
                    + "&client_secret=" + URLEncoder.encode(clientSecret, StandardCharsets.UTF_8)
                    + "&refresh_token=" + URLEncoder.encode(account.getRefreshToken(), StandardCharsets.UTF_8)
                    + "&grant_type=refresh_token";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://oauth2.googleapis.com/token"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Failed to refresh Google access token for {}: {}", account.getAccountEmail(), response.body());
                account.setSyncStatus("REQUIRES_AUTH");
                accountRepository.save(account);
                throw new IllegalStateException("Failed to refresh Google Drive token.");
            }

            JsonNode json = objectMapper.readTree(response.body());
            String newAccessToken = json.path("access_token").asText();
            int expiresIn = json.path("expires_in").asInt(3600);

            account.setAccessToken(newAccessToken);
            account.setTokenExpiresAt(LocalDateTime.now().plusSeconds(expiresIn));
            account.setSyncStatus("SYNCED");
            accountRepository.save(account);

            return newAccessToken;

        } catch (Exception e) {
            log.error("Exception refreshing Google token: ", e);
            throw new RuntimeException("Error refreshing Google access token: " + e.getMessage(), e);
        }
    }

    public String getValidAccessToken(ConnectedAccount account) {
        if (account.getAccessToken() == null || account.getTokenExpiresAt() == null ||
                account.getTokenExpiresAt().isBefore(LocalDateTime.now().plusMinutes(2))) {
            return refreshAccessToken(account);
        }
        return account.getAccessToken();
    }
}
