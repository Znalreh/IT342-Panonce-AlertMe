package edu.cit.panonce.alertme.alert.dto;

public class AlertStatusUpdateMessage {
    private String alertId;
    private String status;
    private String alertTitle;
    private String updatedAt;
    private String eventType;

    public AlertStatusUpdateMessage() {
    }

    public AlertStatusUpdateMessage(String alertId, String status, String alertTitle, String updatedAt) {
        this(alertId, status, alertTitle, updatedAt, "STATUS_UPDATED");
    }

    public AlertStatusUpdateMessage(String alertId, String status, String alertTitle, String updatedAt, String eventType) {
        this.alertId = alertId;
        this.status = status;
        this.alertTitle = alertTitle;
        this.updatedAt = updatedAt;
        this.eventType = eventType;
    }

    public String getAlertId() {
        return alertId;
    }

    public void setAlertId(String alertId) {
        this.alertId = alertId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAlertTitle() {
        return alertTitle;
    }

    public void setAlertTitle(String alertTitle) {
        this.alertTitle = alertTitle;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }
}
