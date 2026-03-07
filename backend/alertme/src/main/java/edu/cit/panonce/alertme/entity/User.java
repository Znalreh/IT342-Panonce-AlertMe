package edu.cit.panonce.alertme.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_email", columnNames = "email"),
        @UniqueConstraint(name = "uk_users_google_subject", columnNames = "google_subject")
    },
    indexes = {
        @Index(name = "idx_users_role", columnList = "role"),
        @Index(name = "idx_users_is_active", columnList = "is_active")
    }
)
public class User {

    public enum UserRole {
        STUDENT,
        SECURITY,
        STAFF,
        ADMIN
    }

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false, updatable = false, columnDefinition = "uuid")
    private UUID id;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "google_subject", length = 255)
    private String googleSubject;

    @Column(name = "first_name", nullable = false, length = 120)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 120)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole role;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    // --- Relationships based on your ERD ---

    // One user (reporter) -> many alerts
    @OneToMany(mappedBy = "reporter", fetch = FetchType.LAZY)
    private List<Alert> reportedAlerts = new ArrayList<>();

    // One user (assignee) -> many assigned alerts (optional)
    @OneToMany(mappedBy = "assignedTo", fetch = FetchType.LAZY)
    private List<Alert> assignedAlerts = new ArrayList<>();

    // One user -> many uploaded media
    @OneToMany(mappedBy = "uploadedBy", fetch = FetchType.LAZY)
    private List<AlertMedia> uploadedMedia = new ArrayList<>();

    // One user -> many status changes (history rows)
    @OneToMany(mappedBy = "changedBy", fetch = FetchType.LAZY)
    private List<AlertStatusHistory> statusChanges = new ArrayList<>();

    // --- lifecycle hooks ---
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

    // --- getters/setters ---
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getGoogleSubject() { return googleSubject; }
    public void setGoogleSubject(String googleSubject) { this.googleSubject = googleSubject; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public Instant getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(Instant lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public List<Alert> getReportedAlerts() { return reportedAlerts; }
    public void setReportedAlerts(List<Alert> reportedAlerts) { this.reportedAlerts = reportedAlerts; }

    public List<Alert> getAssignedAlerts() { return assignedAlerts; }
    public void setAssignedAlerts(List<Alert> assignedAlerts) { this.assignedAlerts = assignedAlerts; }

    public List<AlertMedia> getUploadedMedia() { return uploadedMedia; }
    public void setUploadedMedia(List<AlertMedia> uploadedMedia) { this.uploadedMedia = uploadedMedia; }

    public List<AlertStatusHistory> getStatusChanges() { return statusChanges; }
    public void setStatusChanges(List<AlertStatusHistory> statusChanges) { this.statusChanges = statusChanges; }
}