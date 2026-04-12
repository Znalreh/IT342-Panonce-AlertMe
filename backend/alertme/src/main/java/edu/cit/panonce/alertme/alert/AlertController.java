package edu.cit.panonce.alertme.alert;

import edu.cit.panonce.alertme.alert.dto.AlertRequest;
import edu.cit.panonce.alertme.entity.Alert;
import edu.cit.panonce.alertme.entity.User;
import edu.cit.panonce.alertme.repository.AlertRepository;
import edu.cit.panonce.alertme.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/alerts")
public class AlertController {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;

    public AlertController(AlertRepository alertRepository, UserRepository userRepository) {
        this.alertRepository = alertRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createAlert(@RequestBody AlertRequest request, Authentication authentication) {
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

        if (request.getCategory() == null || request.getCategory().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Category is required."));
        }

        if (request.getPriority() == null || request.getPriority().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Priority is required."));
        }

        if (request.getLocationText() == null || request.getLocationText().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Location is required."));
        }

        if ((request.getTitle() == null || request.getTitle().trim().isEmpty())
            && (request.getDescription() == null || request.getDescription().trim().isEmpty())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Title or description is required."));
        }

        Alert.AlertPriority priority;
        try {
            priority = Alert.AlertPriority.valueOf(request.getPriority().trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", "Unknown priority value."));
        }

        String title = request.getTitle() == null ? "" : request.getTitle().trim();
        String description = request.getDescription() == null ? "" : request.getDescription().trim();
        String fullDescription = title.isEmpty() ? description : title + "\n\n" + description;

        Alert alert = new Alert();
        alert.setReporter(reporter);
        alert.setCategory(request.getCategory().trim());
        alert.setPriority(priority);
        alert.setLocationText(request.getLocationText().trim());
        alert.setDescription(fullDescription);
        alert.setLatitude(request.getLatitude());
        alert.setLongitude(request.getLongitude());
        alert.setGeocodedAddress(request.getGeocodedAddress());

        Alert savedAlert = alertRepository.save(alert);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "message", "Alert reported successfully.",
            "id", savedAlert.getId().toString()
        ));
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
}
