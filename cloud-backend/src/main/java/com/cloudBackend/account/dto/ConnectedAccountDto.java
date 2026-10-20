package com.cloudBackend.account.dto;

import com.cloudBackend.account.entity.ConnectedAccount;

public class ConnectedAccountDto {

    private String id;
    private String name;
    private String email;
    private String type;
    private double storageUsed;  // in GB
    private double storageTotal; // in GB
    private long storageUsedBytes;
    private long storageLimitBytes;
    private String color;
    private String badge;
    private int filesCount;
    private String status;
    private String lastSync;
    private String avatar;
    private String provider;

    public ConnectedAccountDto() {
    }

    public static ConnectedAccountDto fromEntity(ConnectedAccount entity) {
        ConnectedAccountDto dto = new ConnectedAccountDto();
        dto.setId(entity.getId() != null ? String.valueOf(entity.getId()) : "google-0");
        dto.setName(entity.getAccountName() != null && !entity.getAccountName().isBlank()
                ? entity.getAccountName()
                : ("workspace".equalsIgnoreCase(entity.getAccountType()) ? "Workspace Drive" : "Personal Drive"));
        dto.setEmail(entity.getAccountEmail());
        dto.setType(entity.getAccountType() != null ? entity.getAccountType() : "personal");

        long usedBytes = entity.getStorageUsed() != null ? entity.getStorageUsed() : 0L;
        long limitBytes = entity.getStorageLimit() != null && entity.getStorageLimit() > 0
                ? entity.getStorageLimit()
                : (15L * 1024 * 1024 * 1024); // default 15 GB if unset

        dto.setStorageUsedBytes(usedBytes);
        dto.setStorageLimitBytes(limitBytes);
        dto.setStorageUsed(Math.round((usedBytes / (1024.0 * 1024.0 * 1024.0)) * 10.0) / 10.0);
        dto.setStorageTotal(Math.round((limitBytes / (1024.0 * 1024.0 * 1024.0)) * 10.0) / 10.0);

        if ("workspace".equalsIgnoreCase(entity.getAccountType())) {
            dto.setColor("#34A853");
            dto.setBadge("G-Suite Pro");
        } else if ("edu".equalsIgnoreCase(entity.getAccountType())) {
            dto.setColor("#FBBC05");
            dto.setBadge("Edu Cloud");
        } else {
            dto.setColor("#4285F4");
            dto.setBadge("Personal Drive");
        }

        dto.setStatus(entity.getSyncStatus() != null ? entity.getSyncStatus() : "Synced");
        dto.setLastSync("Just now");
        dto.setAvatar(entity.getAvatarUrl() != null && !entity.getAvatarUrl().isBlank()
                ? entity.getAvatarUrl()
                : "https://api.dicebear.com/7.x/identicon/svg?seed=" + entity.getAccountEmail());
        dto.setProvider(entity.getProvider());
        dto.setFilesCount(0); // updated by drive service

        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getStorageUsed() {
        return storageUsed;
    }

    public void setStorageUsed(double storageUsed) {
        this.storageUsed = storageUsed;
    }

    public double getStorageTotal() {
        return storageTotal;
    }

    public void setStorageTotal(double storageTotal) {
        this.storageTotal = storageTotal;
    }

    public long getStorageUsedBytes() {
        return storageUsedBytes;
    }

    public void setStorageUsedBytes(long storageUsedBytes) {
        this.storageUsedBytes = storageUsedBytes;
    }

    public long getStorageLimitBytes() {
        return storageLimitBytes;
    }

    public void setStorageLimitBytes(long storageLimitBytes) {
        this.storageLimitBytes = storageLimitBytes;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getBadge() {
        return badge;
    }

    public void setBadge(String badge) {
        this.badge = badge;
    }

    public int getFilesCount() {
        return filesCount;
    }

    public void setFilesCount(int filesCount) {
        this.filesCount = filesCount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLastSync() {
        return lastSync;
    }

    public void setLastSync(String lastSync) {
        this.lastSync = lastSync;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }
}
