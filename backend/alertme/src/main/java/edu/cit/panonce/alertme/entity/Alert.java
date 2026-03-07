package edu.cit.panonce.alertme.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
    name = "alerts",
    indexes = {
        @Index(name = "idx_alerts_reporter_user_id", columnList = "reporter_user_id"),
        @Index(name = "idx_alerts_assigned_to_user_id", columnList = "assigned_to_user_id"),
        @Index(name = "idx_alerts_status", columnList = "status"),
        @Index(name = "idx_alerts_priority", columnList = "priority"),
        @Index(name = "idx_alerts_created_at", columnList = "created_at")
    }
)
public class Alert {

    public enum AlertPriority {
        LOW,
        MEDIUM,
        HIGH
    }

    public enum AlertStatus {
        RECEIVED,
        INVESTIGATING,
        RESOLVED
    }

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false, columnDefinition = "uuid")
    private UUID id;

    // Many alerts can be reported by one user
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_user_id", nullable = false)
    private User reporter;

    // Optional: many alerts can be assigned to one user (security/staff)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedTo;

    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 10)
    private AlertPriority priority = AlertPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AlertStatus status = AlertStatus.RECEIVED;

    @Column(name = "description", nullable = false, columnDefinition = "text")
    private String description;

    @Column(name = "location_text", nullable = false, length = 255)
    private String locationText;

    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(name = "geocoded_address", length = 255)
    private String geocodedAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    // One alert -> many media attachments
    @OneToMany(mappedBy = "alert", fetch = FetchType.LAZY)
    private List<AlertMedia> mediaAttachments = new ArrayList<>();

    // One alert -> many status history entries
    @OneToMany(mappedBy = "alert", fetch = FetchType.LAZY)
    private List<AlertStatusHistory> statusHistory = new ArrayList<>();

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // getters/setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getReporter() { return reporter; }
    public void setReporter(User reporter) { this.reporter = reporter; }

    public User getAssignedTo() { return assignedTo; }
    public void setAssignedTo(User assignedTo) { this.assignedTo = assignedTo; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public AlertPriority getPriority() { return priority; }
    public void setPriority(AlertPriority priority) { this.priority = priority; }

    public AlertStatus getStatus() { return status; }
    public void setStatus(AlertStatus status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocationText() { return locationText; }
    public void setLocationText(String locationText) { this.locationText = locationText; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public String getGeocodedAddress() { return geocodedAddress; }
    public void setGeocodedAddress(String geocodedAddress) { this.geocodedAddress = geocodedAddress; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }

    public List<AlertMedia> getMediaAttachments() { return mediaAttachments; }
    public void setMediaAttachments(List<AlertMedia> mediaAttachments) { this.mediaAttachments = mediaAttachments; }

    public List<AlertStatusHistory> getStatusHistory() { return statusHistory; }
    public void setStatusHistory(List<AlertStatusHistory> statusHistory) { this.statusHistory = statusHistory; }
}