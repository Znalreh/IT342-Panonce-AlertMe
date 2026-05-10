package edu.cit.panonce.alertme.alert.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class AlertResponse {

    private UUID id;
    private String category;
    private String priority;
    private String status;
    private String description;
    private String locationText;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String geocodedAddress;
    private String createdAt;
    private String updatedAt;
    private String resolvedAt;
    private String reporterEmail;
    private String assignedToName;
    private String assignedToEmail;
    private List<AlertMediaResponse> mediaAttachments;
    private List<AlertStatusHistoryEntryResponse> statusHistory;

    public AlertResponse() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocationText() {
        return locationText;
    }

    public void setLocationText(String locationText) {
        this.locationText = locationText;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public String getGeocodedAddress() {
        return geocodedAddress;
    }

    public void setGeocodedAddress(String geocodedAddress) {
        this.geocodedAddress = geocodedAddress;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(String resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String getReporterEmail() {
        return reporterEmail;
    }

    public void setReporterEmail(String reporterEmail) {
        this.reporterEmail = reporterEmail;
    }

    public String getAssignedToName() {
        return assignedToName;
    }

    public void setAssignedToName(String assignedToName) {
        this.assignedToName = assignedToName;
    }

    public String getAssignedToEmail() {
        return assignedToEmail;
    }

    public void setAssignedToEmail(String assignedToEmail) {
        this.assignedToEmail = assignedToEmail;
    }

    public List<AlertMediaResponse> getMediaAttachments() {
        return mediaAttachments;
    }

    public void setMediaAttachments(List<AlertMediaResponse> mediaAttachments) {
        this.mediaAttachments = mediaAttachments;
    }

    public List<AlertStatusHistoryEntryResponse> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<AlertStatusHistoryEntryResponse> statusHistory) {
        this.statusHistory = statusHistory;
    }
}
