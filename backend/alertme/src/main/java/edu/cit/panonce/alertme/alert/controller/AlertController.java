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
import edu.cit.panonce.alertme.alert.repository.AlertStatusHistoryRepository;
import edu.cit.panonce.alertme.media.service.SupabaseStorageService;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
@RestController
@RequestMapping("/api/v1/alerts")
public class AlertController {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final AlertMediaRepository alertMediaRepository;
    private final AlertStatusHistoryRepository alertStatusHistoryRepository;
    private final SupabaseStorageService supabaseStorageService;

    public AlertController(AlertRepository alertRepository, UserRepository userRepository, AlertMediaRepository alertMediaRepository, AlertStatusHistoryRepository alertStatusHistoryRepository, SupabaseStorageService supabaseStorageService) {
        this.alertRepository = alertRepository;
        this.userRepository = userRepository;
        this.alertMediaRepository = alertMediaRepository;
        this.alertStatusHistoryRepository = alertStatusHistoryRepository;
        this.supabaseStorageService = supabaseStorageService;
    }

    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createAlert(
            @RequestParam("category") String category,
            @RequestParam("priority") String priority,
            @RequestParam("locationText") String locationText,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "geocodedAddress", required = false) String geocodedAddress,
            @RequestParam(value = "files", required = false) MultipartFile[] files,
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

        String alertTitle = title == null ? "" : title.trim();
        String alertDescription = description == null ? "" : description.trim();
        String fullDescription = alertTitle.isEmpty() ? alertDescription : alertTitle + "\n\n" + alertDescription;

        Alert alert = new Alert();
        alert.setReporter(reporter);
        alert.setCategory(category.trim());
        alert.setPriority(alertPriority);
        alert.setLocationText(locationText.trim());
        alert.setDescription(fullDescription);
        if (latitude != null) alert.setLatitude(java.math.BigDecimal.valueOf(latitude));
        if (longitude != null) alert.setLongitude(java.math.BigDecimal.valueOf(longitude));
        alert.setGeocodedAddress(geocodedAddress);

        Alert savedAlert = alertRepository.save(alert);

        // Handle file uploads to Supabase
        if (files != null && files.length > 0) {
            List<AlertMedia> mediaList = new ArrayList<>();
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null) continue;

                try {
                    // Upload file to Supabase and get the storage key
                    String storageKey = supabaseStorageService.uploadFile(file, originalFilename);

                    // Determine file extension for media type detection
                    String extension = "";
                    int dotIndex = originalFilename.lastIndexOf('.');
                    if (dotIndex > 0) {
                        extension = originalFilename.substring(dotIndex);
                    }

                    AlertMedia.MediaType mediaType = determineMediaType(file.getContentType(), extension);
                    if (mediaType == null) continue; // Skip unsupported files

                    // Create media record with storage key from Supabase
                    AlertMedia media = new AlertMedia();
                    media.setAlert(savedAlert);
                    media.setUploadedBy(reporter);
                    media.setMediaType(mediaType);
                    media.setMimeType(file.getContentType());
                    media.setStorageKey(storageKey);
                    media.setOriginalFilename(originalFilename);
                    media.setFileSizeBytes(file.getSize());

                    mediaList.add(media);
                } catch (Exception e) {
                    System.err.println("Failed to upload file " + originalFilename + ": " + e.getMessage());
                    e.printStackTrace();
                    // Continue processing other files
                }
            }

            if (!mediaList.isEmpty()) {
                alertMediaRepository.saveAll(mediaList);
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Alert reported successfully.",
            "id", savedAlert.getId().toString()
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

    private AlertResponse toResponse(Alert alert) {
        AlertResponse response = new AlertResponse();
        response.setId(alert.getId());
        response.setCategory(alert.getCategory());
        response.setPriority(alert.getPriority().name());
        response.setStatus(alert.getStatus().name());
        response.setDescription(alert.getDescription());
        response.setLocationText(alert.getLocationText());
        response.setLatitude(alert.getLatitude());
        response.setLongitude(alert.getLongitude());
        response.setGeocodedAddress(alert.getGeocodedAddress());
        response.setCreatedAt(alert.getCreatedAt() != null ? alert.getCreatedAt().toString() : null);
        response.setUpdatedAt(alert.getUpdatedAt() != null ? alert.getUpdatedAt().toString() : null);
        response.setResolvedAt(alert.getResolvedAt() != null ? alert.getResolvedAt().toString() : null);
        response.setReporterEmail(alert.getReporter() != null ? alert.getReporter().getEmail() : null);

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
