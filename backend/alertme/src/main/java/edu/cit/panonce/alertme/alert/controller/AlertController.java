package edu.cit.panonce.alertme.alert.controller;

import edu.cit.panonce.alertme.alert.dto.AlertResponse;
import edu.cit.panonce.alertme.alert.dto.AlertMediaResponse;
import edu.cit.panonce.alertme.alert.dto.AlertStatusHistoryEntryResponse;
import edu.cit.panonce.alertme.user.entity.User;
import edu.cit.panonce.alertme.user.repository.UserRepository;
import edu.cit.panonce.alertme.alert.entity.Alert;
import edu.cit.panonce.alertme.alert.entity.AlertMedia;
import edu.cit.panonce.alertme.alert.entity.AlertStatusHistory;
import edu.cit.panonce.alertme.alert.repository.AlertRepository;
import edu.cit.panonce.alertme.alert.repository.AlertMediaRepository;
import edu.cit.panonce.alertme.alert.dto.AlertStatusUpdateMessage;
import edu.cit.panonce.alertme.alert.repository.AlertStatusHistoryRepository;
import edu.cit.panonce.alertme.media.service.SupabaseStorageService;
import edu.cit.panonce.alertme.websocket.AlertStatusWebSocketHandler;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/api/v1/alerts")
public class AlertController {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final AlertMediaRepository alertMediaRepository;
    private final AlertStatusHistoryRepository alertStatusHistoryRepository;
    private final SupabaseStorageService supabaseStorageService;
    private final AlertStatusWebSocketHandler alertStatusWebSocketHandler;

    public AlertController(AlertRepository alertRepository, UserRepository userRepository, AlertMediaRepository alertMediaRepository, AlertStatusHistoryRepository alertStatusHistoryRepository, SupabaseStorageService supabaseStorageService, AlertStatusWebSocketHandler alertStatusWebSocketHandler) {
        this.alertRepository = alertRepository;
        this.userRepository = userRepository;
        this.alertMediaRepository = alertMediaRepository;
        this.alertStatusHistoryRepository = alertStatusHistoryRepository;
        this.supabaseStorageService = supabaseStorageService;
        this.alertStatusWebSocketHandler = alertStatusWebSocketHandler;
    }

    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<?> createAlert(
            @RequestParam("category") String category,
            @RequestParam("priority") String priority,
            @RequestParam("locationText") String locationText,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "geocodedAddress", required = false) String geocodedAddress,
            @RequestParam(value = "files", required = false) java.util.List<MultipartFile> files,
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        String username = extractPrincipalName(authentication);
        if (username == null || username.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        User reporter = userRepository.findByEmailIgnoreCase(username)
            .or(() -> userRepository.findByGoogleSubject(username))
            .orElse(null);

        if (reporter == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Reporter not found"));
        }

        if (category == null || category.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Category is required."));
        }

        if (priority == null || priority.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Priority is required."));
        }

        if (locationText == null || locationText.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Location is required."));
        }

        if ((title == null || title.trim().isEmpty())
            && (description == null || description.trim().isEmpty())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Title or description is required."));
        }

        Alert.AlertPriority alertPriority;
        try {
            alertPriority = Alert.AlertPriority.valueOf(priority.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", "Unknown priority value."));
        }

        String rawTitle = title == null ? "" : title.trim();
        String alertDescription = description == null ? "" : description.trim();
        String alertTitle = rawTitle;
        if (alertTitle.isEmpty() && !alertDescription.isEmpty()) {
            int lineEnd = alertDescription.indexOf('\n');
            if (lineEnd == -1) {
                lineEnd = Math.min(alertDescription.length(), 255);
            } else {
                lineEnd = Math.min(lineEnd, 255);
            }
            alertTitle = alertDescription.substring(0, lineEnd).trim();
        }

        Alert alert = new Alert();
        alert.setReporter(reporter);
        alert.setCategory(category.trim());
        alert.setPriority(alertPriority);
        alert.setLocationText(locationText.trim());
        alert.setTitle(alertTitle.isEmpty() ? null : alertTitle);
        alert.setDescription(alertDescription);
        if (latitude != null) alert.setLatitude(java.math.BigDecimal.valueOf(latitude));
        if (longitude != null) alert.setLongitude(java.math.BigDecimal.valueOf(longitude));
        alert.setGeocodedAddress(geocodedAddress);

        Alert savedAlert = alertRepository.save(alert);
        alertRepository.flush(); // Ensure alert is persisted before handling media

        // Handle file uploads to Supabase
        List<AlertMedia> mediaList = new ArrayList<>();
        System.out.println("========== FILE PROCESSING START ==========");
        System.out.println("Files parameter: " + (files == null ? "NULL" : "List of " + files.size()));
        if (files != null && !files.isEmpty()) {
            System.out.println("Processing " + files.size() + " files...");
            for (MultipartFile file : files) {
                System.out.println("Processing file: " + file.getOriginalFilename() + ", isEmpty: " + file.isEmpty() + ", size: " + file.getSize());
                if (file.isEmpty()) {
                    System.out.println("  -> Skipping empty file");
                    continue;
                }

                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null) {
                    System.out.println("  -> Skipping file with null name");
                    continue;
                }

                // Determine file extension for media type detection
                String extension = "";
                int dotIndex = originalFilename.lastIndexOf('.');
                if (dotIndex > 0) {
                    extension = originalFilename.substring(dotIndex);
                }

                AlertMedia.MediaType mediaType = determineMediaType(file.getContentType(), extension);
                System.out.println("Determined mediaType: " + mediaType + " for mimeType: " + file.getContentType() + ", extension: " + extension);
                if (mediaType == null) {
                    System.out.println("  -> Skipping file - unsupported media type");
                    continue;
                }

                String storageKey;
                try {
                    // Upload file to Supabase and get the storage key
                    storageKey = supabaseStorageService.uploadFile(file, originalFilename);
                    System.out.println("Uploaded to Supabase with storageKey: " + storageKey);
                } catch (Exception e) {
                    String errorMessage = "Failed to upload file to Supabase " + originalFilename + ": " + e.getMessage();
                    System.err.println(errorMessage);
                    e.printStackTrace();
                    throw new RuntimeException(errorMessage, e);
                }

                AlertMedia media = new AlertMedia();
                media.setAlert(savedAlert);
                media.setUploadedBy(reporter);
                media.setMediaType(mediaType);
                media.setMimeType(file.getContentType());
                media.setStorageKey(storageKey);
                media.setOriginalFilename(originalFilename);
                media.setFileSizeBytes(file.getSize());

                mediaList.add(media);
                System.out.println("Added media to list. Total media items: " + mediaList.size());
            }

            System.out.println("Final mediaList size before save: " + mediaList.size());
            if (!mediaList.isEmpty()) {
                alertMediaRepository.saveAll(mediaList);
                System.out.println("Saved " + mediaList.size() + " media items to database");
            } else {
                System.out.println("No valid media items to save");
            }
        } else {
            System.out.println("No files to process");
        }

        alertStatusWebSocketHandler.broadcastStatusUpdate(new AlertStatusUpdateMessage(
            savedAlert.getId().toString(),
            savedAlert.getStatus().name(),
            savedAlert.getTitle(),
            java.time.Instant.now().toString(),
            "ALERT_CREATED"
        ));

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Alert reported successfully.",
            "id", savedAlert.getId().toString(),
            "mediaCount", mediaList != null ? mediaList.size() : 0
        ));
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<AlertResponse> getAlerts() {
        return alertRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @PostMapping("/{alertId}/comment")
    public ResponseEntity<?> postAlertComment(
            @PathVariable("alertId") String alertId,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        String username = extractPrincipalName(authentication);
        if (username == null || username.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        User commenter = userRepository.findByEmailIgnoreCase(username)
            .or(() -> userRepository.findByGoogleSubject(username))
            .orElse(null);

        if (commenter == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not found"));
        }

        Alert alert;
        try {
            UUID uuid = UUID.fromString(alertId);
            alert = alertRepository.findById(uuid).orElse(null);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid alert ID"));
        }

        if (alert == null) {
            return ResponseEntity.notFound().build();
        }

        String comment = payload.getOrDefault("comment", "").trim();
        if (comment.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Comment cannot be empty"));
        }

        AlertStatusHistory history = new AlertStatusHistory();
        history.setAlert(alert);
        history.setChangedBy(commenter);
        history.setFromStatus(null);
        history.setToStatus(alert.getStatus());
        history.setComment(comment);

        AlertStatusHistory saved = alertStatusHistoryRepository.save(history);

        AlertStatusHistoryEntryResponse response = new AlertStatusHistoryEntryResponse();
        response.setId(saved.getId());
        response.setFromStatus(null);
        response.setToStatus(saved.getToStatus().name());
        response.setComment(saved.getComment());
        response.setChangedByName(commenter.getFirstName() + " " + commenter.getLastName());
        response.setCreatedAt(saved.getCreatedAt() != null ? saved.getCreatedAt().toString() : null);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Admin endpoints
    @PutMapping("/{alertId}/status")
    public ResponseEntity<?> updateAlertStatus(
            @PathVariable("alertId") String alertId,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        String username = extractPrincipalName(authentication);
        if (username == null || username.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        User admin = userRepository.findByEmailIgnoreCase(username)
            .or(() -> userRepository.findByGoogleSubject(username))
            .orElse(null);

        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not found"));
        }

        // Check if user has admin privileges
        if (admin.getRole() != User.UserRole.ADMIN && admin.getRole() != User.UserRole.SECURITY && admin.getRole() != User.UserRole.STAFF) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Insufficient privileges"));
        }

        Alert alert;
        try {
            UUID uuid = UUID.fromString(alertId);
            alert = alertRepository.findById(uuid).orElse(null);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid alert ID"));
        }

        if (alert == null) {
            return ResponseEntity.notFound().build();
        }

        String newStatusStr = payload.getOrDefault("status", "").trim().toUpperCase();
        if (newStatusStr.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status is required"));
        }

        Alert.AlertStatus newStatus;
        try {
            newStatus = Alert.AlertStatus.valueOf(newStatusStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid status value"));
        }

        String comment = payload.getOrDefault("comment", "").trim();

        Alert.AlertStatus oldStatus = alert.getStatus();
        alert.setStatus(newStatus);

        if (newStatus == Alert.AlertStatus.RESOLVED) {
            alert.setResolvedAt(java.time.Instant.now());
        } else if (oldStatus == Alert.AlertStatus.RESOLVED && newStatus != Alert.AlertStatus.RESOLVED) {
            alert.setResolvedAt(null);
        }

        Alert savedAlert = alertRepository.save(alert);

        // Create status history entry
        AlertStatusHistory history = new AlertStatusHistory();
        history.setAlert(savedAlert);
        history.setChangedBy(admin);
        history.setFromStatus(oldStatus);
        history.setToStatus(newStatus);
        if (!comment.isEmpty()) {
            history.setComment(comment);
        }

        alertStatusHistoryRepository.save(history);
        alertStatusWebSocketHandler.broadcastStatusUpdate(new AlertStatusUpdateMessage(alertId, newStatus.name(), savedAlert.getTitle(), java.time.Instant.now().toString(), "STATUS_UPDATED"));

        return ResponseEntity.ok(Map.of("message", "Alert status updated successfully"));
    }

    @PutMapping("/{alertId}/assign")
    public ResponseEntity<?> assignAlert(
            @PathVariable("alertId") String alertId,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        String username = extractPrincipalName(authentication);
        if (username == null || username.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        User admin = userRepository.findByEmailIgnoreCase(username)
            .or(() -> userRepository.findByGoogleSubject(username))
            .orElse(null);

        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not found"));
        }

        // Check if user has admin privileges
        if (admin.getRole() != User.UserRole.ADMIN && admin.getRole() != User.UserRole.SECURITY && admin.getRole() != User.UserRole.STAFF) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Insufficient privileges"));
        }

        Alert alert;
        try {
            UUID uuid = UUID.fromString(alertId);
            alert = alertRepository.findById(uuid).orElse(null);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid alert ID"));
        }

        if (alert == null) {
            return ResponseEntity.notFound().build();
        }

        String assignedUserIdStr = payload.getOrDefault("assignedToUserId", "").trim();
        User assignedUser = null;

        if (!assignedUserIdStr.isEmpty()) {
            try {
                UUID assignedUserId = UUID.fromString(assignedUserIdStr);
                assignedUser = userRepository.findById(assignedUserId).orElse(null);
                if (assignedUser == null) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Assigned user not found"));
                }
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid user ID"));
            }
        }

        alert.setAssignedTo(assignedUser);
        alertRepository.save(alert);

        return ResponseEntity.ok(Map.of("message", "Alert assignment updated successfully"));
    }

    @DeleteMapping("/{alertId}")
    @Transactional
    public ResponseEntity<?> deleteAlert(
            @PathVariable("alertId") String alertId,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        String username = extractPrincipalName(authentication);
        if (username == null || username.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        User admin = userRepository.findByEmailIgnoreCase(username)
            .or(() -> userRepository.findByGoogleSubject(username))
            .orElse(null);

        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not found"));
        }

        // Check if user has admin privileges
        if (admin.getRole() != User.UserRole.ADMIN && admin.getRole() != User.UserRole.SECURITY && admin.getRole() != User.UserRole.STAFF) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Insufficient privileges"));
        }

        Alert alert;
        try {
            UUID uuid = UUID.fromString(alertId);
            alert = alertRepository.findById(uuid).orElse(null);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid alert ID"));
        }

        if (alert == null) {
            return ResponseEntity.notFound().build();
        }

        alertMediaRepository.deleteAll(alert.getMediaAttachments());
        alertStatusHistoryRepository.deleteAll(alert.getStatusHistory());
        alertRepository.delete(alert);
        alertStatusWebSocketHandler.broadcastStatusUpdate(new AlertStatusUpdateMessage(alertId, "DELETED", alert.getTitle(), java.time.Instant.now().toString(), "ALERT_DELETED"));

        return ResponseEntity.ok(Map.of("message", "Alert deleted successfully"));
    }

    @GetMapping("/admin/stats")
    public ResponseEntity<?> getAdminStats(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        String username = extractPrincipalName(authentication);
        if (username == null || username.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        User admin = userRepository.findByEmailIgnoreCase(username)
            .or(() -> userRepository.findByGoogleSubject(username))
            .orElse(null);

        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not found"));
        }

        // Check if user has admin privileges
        if (admin.getRole() != User.UserRole.ADMIN && admin.getRole() != User.UserRole.SECURITY && admin.getRole() != User.UserRole.STAFF) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Insufficient privileges"));
        }

        List<Alert> allAlerts = alertRepository.findAll();

        long totalAlerts = allAlerts.size();
        long receivedAlerts = allAlerts.stream().filter(a -> a.getStatus() == Alert.AlertStatus.RECEIVED).count();
        long investigatingAlerts = allAlerts.stream().filter(a -> a.getStatus() == Alert.AlertStatus.INVESTIGATING).count();
        long resolvedAlerts = allAlerts.stream().filter(a -> a.getStatus() == Alert.AlertStatus.RESOLVED).count();

        return ResponseEntity.ok(Map.of(
            "totalAlerts", totalAlerts,
            "receivedAlerts", receivedAlerts,
            "investigatingAlerts", investigatingAlerts,
            "resolvedAlerts", resolvedAlerts
        ));
    }

    @GetMapping("/admin")
    @Transactional(readOnly = true)
    public List<AlertResponse> getAlertsForAdmin(
            @RequestParam(value = "status", required = false) String statusFilter,
            @RequestParam(value = "category", required = false) String categoryFilter,
            @RequestParam(value = "priority", required = false) String priorityFilter,
            @RequestParam(value = "search", required = false) String searchQuery,
            Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("Unauthorized");
        }

        String username = extractPrincipalName(authentication);
        if (username == null || username.isBlank()) {
            throw new RuntimeException("Unauthorized");
        }

        User admin = userRepository.findByEmailIgnoreCase(username)
            .or(() -> userRepository.findByGoogleSubject(username))
            .orElse(null);

        if (admin == null) {
            throw new RuntimeException("User not found");
        }

        // Check if user has admin privileges
        if (admin.getRole() != User.UserRole.ADMIN && admin.getRole() != User.UserRole.SECURITY && admin.getRole() != User.UserRole.STAFF) {
            throw new RuntimeException("Insufficient privileges");
        }

        List<Alert> alerts = alertRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));

        // Apply filters
        if (statusFilter != null && !statusFilter.trim().isEmpty()) {
            try {
                Alert.AlertStatus status = Alert.AlertStatus.valueOf(statusFilter.trim().toUpperCase());
                alerts = alerts.stream().filter(a -> a.getStatus() == status).collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Invalid status, ignore filter
            }
        }

        if (categoryFilter != null && !categoryFilter.trim().isEmpty()) {
            alerts = alerts.stream()
                .filter(a -> a.getCategory().toLowerCase().contains(categoryFilter.trim().toLowerCase()))
                .collect(Collectors.toList());
        }

        if (priorityFilter != null && !priorityFilter.trim().isEmpty()) {
            try {
                Alert.AlertPriority priority = Alert.AlertPriority.valueOf(priorityFilter.trim().toUpperCase());
                alerts = alerts.stream().filter(a -> a.getPriority() == priority).collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Invalid priority, ignore filter
            }
        }

        if (searchQuery != null && !searchQuery.trim().isEmpty()) {
            String query = searchQuery.trim().toLowerCase();
            alerts = alerts.stream()
                .filter(a ->
                    a.getDescription().toLowerCase().contains(query) ||
                    a.getLocationText().toLowerCase().contains(query) ||
                    (a.getReporter() != null && (a.getReporter().getFirstName() + " " + a.getReporter().getLastName()).toLowerCase().contains(query)) ||
                    (a.getReporter() != null && a.getReporter().getEmail().toLowerCase().contains(query))
                )
                .collect(Collectors.toList());
        }

        return alerts.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private AlertResponse toResponse(Alert alert) {
        AlertResponse response = new AlertResponse();
        response.setId(alert.getId());
        response.setCategory(alert.getCategory());
        response.setPriority(alert.getPriority().name());
        response.setStatus(alert.getStatus().name());
        String alertTitle = alert.getTitle();
        if (alertTitle == null || alertTitle.isBlank()) {
            alertTitle = deriveTitleFromDescription(alert.getDescription());
        }
        response.setTitle(alertTitle);
        response.setDescription(alert.getDescription());
        response.setLocationText(alert.getLocationText());
        response.setLatitude(alert.getLatitude());
        response.setLongitude(alert.getLongitude());
        response.setGeocodedAddress(alert.getGeocodedAddress());
        response.setCreatedAt(alert.getCreatedAt() != null ? alert.getCreatedAt().toString() : null);
        response.setUpdatedAt(alert.getUpdatedAt() != null ? alert.getUpdatedAt().toString() : null);
        response.setResolvedAt(alert.getResolvedAt() != null ? alert.getResolvedAt().toString() : null);
        response.setReporterEmail(alert.getReporter() != null ? alert.getReporter().getEmail() : null);

        if (alert.getAssignedTo() != null) {
            response.setAssignedToName(alert.getAssignedTo().getFirstName() + " " + alert.getAssignedTo().getLastName());
            response.setAssignedToEmail(alert.getAssignedTo().getEmail());
        }

        if (alert.getMediaAttachments() != null) {
            response.setMediaAttachments(alert.getMediaAttachments().stream()
                .map(media -> {
                    AlertMediaResponse mediaResponse = new AlertMediaResponse();
                    mediaResponse.setId(media.getId());
                    mediaResponse.setMediaType(media.getMediaType().name());
                    mediaResponse.setMimeType(media.getMimeType());
                    mediaResponse.setStorageKey(media.getStorageKey());
                    mediaResponse.setOriginalFilename(media.getOriginalFilename());
                    mediaResponse.setFileSizeBytes(media.getFileSizeBytes());
                    mediaResponse.setCreatedAt(media.getCreatedAt() != null ? media.getCreatedAt().toString() : null);
                    return mediaResponse;
                })
                .toList());
        }

        if (alert.getStatusHistory() != null) {
            response.setStatusHistory(alert.getStatusHistory().stream()
                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .map(history -> {
                    AlertStatusHistoryEntryResponse historyResponse = new AlertStatusHistoryEntryResponse();
                    historyResponse.setId(history.getId());
                    historyResponse.setFromStatus(history.getFromStatus() != null ? history.getFromStatus().name() : null);
                    historyResponse.setToStatus(history.getToStatus() != null ? history.getToStatus().name() : null);
                    historyResponse.setComment(history.getComment());
                    String userName = "Unknown";
                    if (history.getChangedBy() != null) {
                        String firstName = history.getChangedBy().getFirstName();
                        String lastName = history.getChangedBy().getLastName();
                        if (firstName != null && lastName != null) {
                            userName = firstName + " " + lastName;
                        } else if (firstName != null) {
                            userName = firstName;
                        } else if (lastName != null) {
                            userName = lastName;
                        } else {
                            userName = history.getChangedBy().getEmail();
                        }
                    }
                    historyResponse.setChangedByName(userName);
                    historyResponse.setCreatedAt(history.getCreatedAt() != null ? history.getCreatedAt().toString() : null);
                    return historyResponse;
                })
                .toList());
        }

        return response;
    }

    private String deriveTitleFromDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        String[] lines = description.split("\\R", 2);
        String firstLine = lines[0].trim();
        return firstLine.isEmpty() ? null : firstLine;
    }

    private String extractPrincipalName(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }

        if (principal instanceof OAuth2User oauth2User) {
            String email = stringValue(oauth2User.getAttribute("email"));
            if (!email.isBlank()) {
                return email;
            }
            String googleSubject = stringValue(oauth2User.getAttribute("sub"));
            if (!googleSubject.isBlank()) {
                return googleSubject;
            }
        }

        return authentication.getName();
    }

    private String stringValue(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private AlertMedia.MediaType determineMediaType(String mimeType, String extension) {
        if (mimeType != null) {
            if (mimeType.startsWith("image/")) {
                return AlertMedia.MediaType.PHOTO;
            }
            if (mimeType.startsWith("video/")) {
                return AlertMedia.MediaType.VIDEO;
            }
        }
        // Fallback to extension
        String ext = extension.toLowerCase();
        if (ext.equals(".jpg") || ext.equals(".jpeg") || ext.equals(".png") || ext.equals(".gif") || ext.equals(".webp")) {
            return AlertMedia.MediaType.PHOTO;
        }
        if (ext.equals(".mp4") || ext.equals(".avi") || ext.equals(".mov") || ext.equals(".mkv")) {
            return AlertMedia.MediaType.VIDEO;
        }
        return null; // Unsupported
    }
}
