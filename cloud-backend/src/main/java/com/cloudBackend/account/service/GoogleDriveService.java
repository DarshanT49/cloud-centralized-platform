package com.cloudBackend.account.service;

import com.cloudBackend.account.dto.ConnectedAccountDto;
import com.cloudBackend.account.dto.DriveFileDto;
import com.cloudBackend.account.entity.ConnectedAccount;
import com.cloudBackend.account.repository.ConnectedAccountRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class GoogleDriveService {

    private static final Logger log = LoggerFactory.getLogger(GoogleDriveService.class);

    private final ConnectedAccountRepository accountRepository;
    private final GoogleOAuthService oAuthService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GoogleDriveService(ConnectedAccountRepository accountRepository, GoogleOAuthService oAuthService) {
        this.accountRepository = accountRepository;
        this.oAuthService = oAuthService;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newHttpClient();
    }

    public List<ConnectedAccountDto> getConnectedAccounts(Long userId) {
        List<ConnectedAccount> accounts = accountRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<ConnectedAccountDto> dtos = new ArrayList<>();

        for (ConnectedAccount acc : accounts) {
            ConnectedAccountDto dto = ConnectedAccountDto.fromEntity(acc);
            dtos.add(dto);
        }

        return dtos;
    }

    public static class DriveFilesResult {
        private List<DriveFileDto> files = new ArrayList<>();
        private boolean apiDisabled = false;
        private boolean needsReauth = false;
        private String activationUrl = "https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=703955159949";
        private String errorMessage;

        public List<DriveFileDto> getFiles() { return files; }
        public void setFiles(List<DriveFileDto> files) { this.files = files; }
        public boolean isApiDisabled() { return apiDisabled; }
        public void setApiDisabled(boolean apiDisabled) { this.apiDisabled = apiDisabled; }
        public boolean isNeedsReauth() { return needsReauth; }
        public void setNeedsReauth(boolean needsReauth) { this.needsReauth = needsReauth; }
        public String getActivationUrl() { return activationUrl; }
        public void setActivationUrl(String activationUrl) { this.activationUrl = activationUrl; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    }

    public List<DriveFileDto> getFiles(Long userId, String accountId, String search, Boolean starred, Boolean trashed) {
        return getFilesResult(userId, accountId, search, starred, trashed).getFiles();
    }

    public DriveFilesResult getFilesResult(Long userId, String accountId, String search, Boolean starred, Boolean trashed) {
        DriveFilesResult result = new DriveFilesResult();
        List<ConnectedAccount> accounts;

        if (accountId == null || accountId.isBlank() || "all".equalsIgnoreCase(accountId)) {
            accounts = accountRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else {
            try {
                Long accId = Long.parseLong(accountId.replace("google-", ""));
                accounts = accountRepository.findByIdAndUserId(accId, userId)
                        .map(List::of)
                        .orElse(Collections.emptyList());
            } catch (NumberFormatException e) {
                accounts = accountRepository.findByUserIdOrderByCreatedAtDesc(userId);
            }
        }

        for (ConnectedAccount account : accounts) {
            try {
                fetchFilesFromDrive(account, search, starred, trashed, result);
            } catch (Exception e) {
                log.error("Failed to fetch files from Google Drive account {}: {}", account.getAccountEmail(), e.getMessage());
            }
        }

        return result;
    }

    private void fetchFilesFromDrive(ConnectedAccount account, String search, Boolean starred, Boolean trashed, DriveFilesResult result) {
        try {
            String accessToken = oAuthService.getValidAccessToken(account);

            StringBuilder queryBuilder = new StringBuilder();
            if (trashed != null) {
                queryBuilder.append("trashed = ").append(trashed);
            } else {
                queryBuilder.append("(trashed = false or trashed = true)");
            }

            if (starred != null && starred) {
                queryBuilder.append(" and starred = true");
            }

            if (search != null && !search.isBlank()) {
                queryBuilder.append(" and name contains '").append(search.replace("'", "\\'")).append("'");
            }

            String q = URLEncoder.encode(queryBuilder.toString(), StandardCharsets.UTF_8);
            String fields = URLEncoder.encode("files(id,name,mimeType,size,starred,trashed,shared,modifiedTime,webViewLink,webContentLink,parents)", StandardCharsets.UTF_8);
            String url = "https://www.googleapis.com/drive/v3/files?pageSize=100&q=" + q + "&fields=" + fields;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Bearer " + accessToken)
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode items = root.path("files");

                ConnectedAccountDto accDto = ConnectedAccountDto.fromEntity(account);

                for (JsonNode item : items) {
                    DriveFileDto file = new DriveFileDto();
                    file.setId(item.path("id").asText());
                    file.setName(item.path("name").asText());
                    String mimeType = item.path("mimeType").asText("application/octet-stream");
                    file.setMimeType(mimeType);
                    file.setType(DriveFileDto.mapMimeType(mimeType));

                    long sizeBytes = item.path("size").asLong(0L);
                    file.setSize(DriveFileDto.formatFileSize(sizeBytes));
                    file.setNumericMb(Math.round((sizeBytes / (1024.0 * 1024.0)) * 10.0) / 10.0);

                    file.setStarred(item.path("starred").asBoolean(false));
                    file.setTrashed(item.path("trashed").asBoolean(false));
                    file.setShared(item.path("shared").asBoolean(false));
                    file.setWebViewLink(item.path("webViewLink").asText(null));
                    file.setWebContentLink(item.path("webContentLink").asText(null));

                    String modifiedTime = item.path("modifiedTime").asText(null);
                    if (modifiedTime != null) {
                        try {
                            ZonedDateTime zdt = ZonedDateTime.parse(modifiedTime);
                            file.setDate(zdt.format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));
                        } catch (Exception e) {
                            file.setDate("Recently");
                        }
                    } else {
                        file.setDate("Recently");
                    }

                    file.setFolder("Drive Root");
                    file.setAccountId(accDto.getId());
                    file.setAccountName(accDto.getName());
                    file.setAccountColor(accDto.getColor());

                    result.getFiles().add(file);
                }
            } else if (response.statusCode() == 403 && response.body().contains("SERVICE_DISABLED")) {
                log.error("Google Drive API is disabled in your Google Cloud Console project. Enable it at: https://console.developers.google.com/apis/api/drive.googleapis.com/overview");
                result.setApiDisabled(true);
                result.setErrorMessage("Google Drive API is not enabled in your Google Cloud Console project.");
            } else if (response.statusCode() == 403 && (response.body().contains("ACCESS_TOKEN_SCOPE_INSUFFICIENT") || response.body().contains("insufficientPermissions"))) {
                log.warn("Google Drive API access token has insufficient scopes for {}. User needs to re-authorize with Drive scope.", account.getAccountEmail());
                result.setNeedsReauth(true);
                result.setErrorMessage("Google Drive permissions are required. Please re-authorize your connected Drive account.");
            } else {
                log.warn("Google Drive API files list error for {}: {}", account.getAccountEmail(), response.body());
            }
        } catch (Exception e) {
            log.error("Error reading Google Drive files: ", e);
        }
    }

    public DriveFileDto uploadFile(Long userId, Long accountId, MultipartFile file, String folderId) {
        ConnectedAccount account = null;
        if (accountId != null && accountId > 0) {
            account = accountRepository.findByIdAndUserId(accountId, userId).orElse(null);
        }
        if (account == null) {
            List<ConnectedAccount> userAccounts = accountRepository.findByUserIdOrderByCreatedAtDesc(userId);
            if (!userAccounts.isEmpty()) {
                account = userAccounts.get(0);
            }
        }
        if (account == null) {
            throw new IllegalArgumentException("No connected Google Drive account found to upload the file to.");
        }

        String accessToken = oAuthService.getValidAccessToken(account);
        String fileName = file.getOriginalFilename() != null && !file.getOriginalFilename().isBlank()
                ? file.getOriginalFilename()
                : "upload_" + System.currentTimeMillis();
        String contentType = file.getContentType() != null && !file.getContentType().isBlank()
                ? file.getContentType()
                : "application/octet-stream";

        try {
            String boundary = "CloudVaultBoundary" + System.currentTimeMillis();

            // 1. Build metadata JSON
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("name", fileName);
            metadata.put("mimeType", contentType);
            if (folderId != null && !folderId.isBlank() && !"root".equalsIgnoreCase(folderId)) {
                metadata.put("parents", List.of(folderId));
            }
            String metadataJson = objectMapper.writeValueAsString(metadata);

            // 2. Construct multipart/related body
            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            // Part 1: Metadata
            String part1Header = "--" + boundary + "\r\n"
                    + "Content-Type: application/json; charset=UTF-8\r\n\r\n"
                    + metadataJson + "\r\n";
            baos.write(part1Header.getBytes(StandardCharsets.UTF_8));

            // Part 2: Media binary data
            String part2Header = "--" + boundary + "\r\n"
                    + "Content-Type: " + contentType + "\r\n\r\n";
            baos.write(part2Header.getBytes(StandardCharsets.UTF_8));

            try (InputStream in = file.getInputStream()) {
                in.transferTo(baos);
            }

            // Closing boundary
            String closingBoundary = "\r\n--" + boundary + "--\r\n";
            baos.write(closingBoundary.getBytes(StandardCharsets.UTF_8));

            byte[] requestBody = baos.toByteArray();

            String uploadUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart"
                    + "&fields=" + URLEncoder.encode("id,name,mimeType,size,starred,trashed,shared,modifiedTime,webViewLink,webContentLink,parents", StandardCharsets.UTF_8);

            HttpRequest uploadRequest = HttpRequest.newBuilder()
                    .uri(URI.create(uploadUrl))
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Content-Type", "multipart/related; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(uploadRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200 || response.statusCode() == 201) {
                JsonNode item = objectMapper.readTree(response.body());
                ConnectedAccountDto accDto = ConnectedAccountDto.fromEntity(account);

                DriveFileDto fileDto = new DriveFileDto();
                fileDto.setId(item.path("id").asText());
                fileDto.setName(item.path("name").asText(fileName));
                String mime = item.path("mimeType").asText(contentType);
                fileDto.setMimeType(mime);
                fileDto.setType(DriveFileDto.mapMimeType(mime));

                long sizeBytes = item.path("size").asLong(file.getSize());
                fileDto.setSize(DriveFileDto.formatFileSize(sizeBytes));
                fileDto.setNumericMb(Math.round((sizeBytes / (1024.0 * 1024.0)) * 10.0) / 10.0);

                fileDto.setStarred(item.path("starred").asBoolean(false));
                fileDto.setTrashed(item.path("trashed").asBoolean(false));
                fileDto.setShared(item.path("shared").asBoolean(false));
                fileDto.setWebViewLink(item.path("webViewLink").asText(null));
                fileDto.setWebContentLink(item.path("webContentLink").asText(null));
                fileDto.setDate("Just now");
                fileDto.setFolder(folderId != null && !folderId.isBlank() ? "Drive Folder" : "Drive Root");
                fileDto.setAccountId(accDto.getId());
                fileDto.setAccountName(accDto.getName());
                fileDto.setAccountColor(accDto.getColor());

                // Update storage used on account entity
                try {
                    account.setStorageUsed(account.getStorageUsed() + sizeBytes);
                    accountRepository.save(account);
                } catch (Exception e) {
                    log.warn("Could not increment local storage metric: {}", e.getMessage());
                }

                return fileDto;
            } else {
                log.error("Failed to upload file to Google Drive: {} {}", response.statusCode(), response.body());
                throw new RuntimeException("Google Drive upload failed (" + response.statusCode() + "): " + response.body());
            }

        } catch (Exception e) {
            log.error("Error uploading file to Google Drive: ", e);
            throw new RuntimeException("File upload failed: " + e.getMessage(), e);
        }
    }

    public DriveFileDto createFolder(Long userId, Long accountId, String folderName, String parentFolderId) {
        ConnectedAccount account = null;
        if (accountId != null && accountId > 0) {
            account = accountRepository.findByIdAndUserId(accountId, userId).orElse(null);
        }
        if (account == null) {
            List<ConnectedAccount> userAccounts = accountRepository.findByUserIdOrderByCreatedAtDesc(userId);
            if (!userAccounts.isEmpty()) {
                account = userAccounts.get(0);
            }
        }
        if (account == null) {
            throw new IllegalArgumentException("No connected Google Drive account found.");
        }

        String accessToken = oAuthService.getValidAccessToken(account);

        try {
            Map<String, Object> folderMeta = new HashMap<>();
            folderMeta.put("name", folderName != null && !folderName.isBlank() ? folderName : "New Folder");
            folderMeta.put("mimeType", "application/vnd.google-apps.folder");
            if (parentFolderId != null && !parentFolderId.isBlank() && !"root".equalsIgnoreCase(parentFolderId)) {
                folderMeta.put("parents", List.of(parentFolderId));
            }

            String bodyJson = objectMapper.writeValueAsString(folderMeta);

            String createUrl = "https://www.googleapis.com/drive/v3/files?fields="
                    + URLEncoder.encode("id,name,mimeType,size,starred,trashed,shared,modifiedTime,webViewLink,webContentLink,parents", StandardCharsets.UTF_8);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(createUrl))
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Content-Type", "application/json; charset=UTF-8")
                    .POST(HttpRequest.BodyPublishers.ofString(bodyJson, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200 || response.statusCode() == 201) {
                JsonNode item = objectMapper.readTree(response.body());
                ConnectedAccountDto accDto = ConnectedAccountDto.fromEntity(account);

                DriveFileDto fileDto = new DriveFileDto();
                fileDto.setId(item.path("id").asText());
                fileDto.setName(item.path("name").asText(folderName));
                fileDto.setMimeType("application/vnd.google-apps.folder");
                fileDto.setType("folder");
                fileDto.setSize("--");
                fileDto.setNumericMb(0.0);
                fileDto.setStarred(false);
                fileDto.setTrashed(false);
                fileDto.setShared(false);
                fileDto.setWebViewLink(item.path("webViewLink").asText(null));
                fileDto.setDate("Just now");
                fileDto.setFolder("Drive Root");
                fileDto.setAccountId(accDto.getId());
                fileDto.setAccountName(accDto.getName());
                fileDto.setAccountColor(accDto.getColor());

                return fileDto;
            } else {
                log.error("Failed to create folder in Google Drive: {} {}", response.statusCode(), response.body());
                throw new RuntimeException("Google Drive folder creation failed: " + response.body());
            }
        } catch (Exception e) {
            log.error("Error creating folder in Google Drive: ", e);
            throw new RuntimeException("Folder creation failed: " + e.getMessage(), e);
        }
    }

    public void unlinkAccount(Long userId, Long accountId) {
        accountRepository.deleteByIdAndUserId(accountId, userId);
    }
}
