package edu.cit.panonce.alertme.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "alert_status_history",
    indexes = {
        @Index(name = "idx_alert_status_history_alert_id", columnList = "alert_id"),
        @Index(name = "idx_alert_status_history_changed_by_user_id", columnList = "changed_by_user_id"),
        @Index(name = "idx_alert_status_history_created_at", columnList = "created_at")
    }
)
public class AlertStatusHistory {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false, columnDefinition = "uuid")
    private UUID id;

    // Many history rows can belong to one alert
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "alert_id", nullable = false)
    private Alert alert;

    // Many history rows can be made by one user
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "changed_by_user_id", nullable = false)
    private User changedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 20)
    private Alert.AlertStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 20)
    private Alert.AlertStatus toStatus;

    @Column(name = "comment", columnDefinition = "text")
    private String comment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    // getters/setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Alert getAlert() { return alert; }
    public void setAlert(Alert alert) { this.alert = alert; }

    public User getChangedBy() { return changedBy; }
    public void setChangedBy(User changedBy) { this.changedBy = changedBy; }

    public Alert.AlertStatus getFromStatus() { return fromStatus; }
    public void setFromStatus(Alert.AlertStatus fromStatus) { this.fromStatus = fromStatus; }

    public Alert.AlertStatus getToStatus() { return toStatus; }
    public void setToStatus(Alert.AlertStatus toStatus) { this.toStatus = toStatus; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public Instant getCreatedAt() { return createdAt; }
}