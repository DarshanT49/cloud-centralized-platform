package com.cloudBackend.account.dto;

public class DriveFileDto {

    private String id;
    private String name;
    private String size;
    private double numericMb;
    private String type; // doc, image, video, sheet, archive, folder
    private String mimeType;
    private String date;
    private boolean starred;
    private boolean trashed;
    private String folder;
    private String accountId;
    private String accountName;
    private String accountColor;
    private String webViewLink;
    private String webContentLink;
    private boolean shared;

    public DriveFileDto() {
    }

    public static String mapMimeType(String mimeType) {
        if (mimeType == null) return "doc";
        if (mimeType.contains("folder")) return "folder";
        if (mimeType.contains("image")) return "image";
        if (mimeType.contains("video")) return "video";
        if (mimeType.contains("spreadsheet") || mimeType.contains("sheet") || mimeType.contains("excel")) return "sheet";
        if (mimeType.contains("zip") || mimeType.contains("tar") || mimeType.contains("archive") || mimeType.contains("compressed")) return "archive";
        return "doc";
    }

    public static String formatFileSize(long bytes) {
        if (bytes <= 0) return "0 B";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        return String.format("%.2f GB", bytes / (1024.0 * 1024.0 * 1024.0));
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

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public double getNumericMb() {
        return numericMb;
    }

    public void setNumericMb(double numericMb) {
        this.numericMb = numericMb;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public boolean isStarred() {
        return starred;
    }

    public void setStarred(boolean starred) {
        this.starred = starred;
    }

    public boolean isTrashed() {
        return trashed;
    }

    public void setTrashed(boolean trashed) {
        this.trashed = trashed;
    }

    public String getFolder() {
        return folder;
    }

    public void setFolder(String folder) {
        this.folder = folder;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getAccountColor() {
        return accountColor;
    }

    public void setAccountColor(String accountColor) {
        this.accountColor = accountColor;
    }

    public String getWebViewLink() {
        return webViewLink;
    }

    public void setWebViewLink(String webViewLink) {
        this.webViewLink = webViewLink;
    }

    public String getWebContentLink() {
        return webContentLink;
    }

    public void setWebContentLink(String webContentLink) {
        this.webContentLink = webContentLink;
    }

    public boolean isShared() {
        return shared;
    }

    public void setShared(boolean shared) {
        this.shared = shared;
    }
}
