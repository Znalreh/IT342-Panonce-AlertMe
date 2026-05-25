package edu.cit.panonce.alertme.auth;

import edu.cit.panonce.alertme.auth.dto.AuthResponse;
import edu.cit.panonce.alertme.auth.dto.ChangePasswordRequest;
import edu.cit.panonce.alertme.auth.dto.LoginRequest;
import edu.cit.panonce.alertme.auth.dto.RegisterRequest;
import edu.cit.panonce.alertme.auth.dto.UpdateProfileRequest;
import edu.cit.panonce.alertme.auth.dto.UserProfileResponse;
import edu.cit.panonce.alertme.user.entity.User;
import edu.cit.panonce.alertme.user.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        String username = extractPrincipalName(authentication);
        if (username == null || username.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        User user = userRepository.findByEmailIgnoreCase(username)
            .or(() -> userRepository.findByGoogleSubject(username))
            .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not found"));
        }

        UserProfileResponse profile = new UserProfileResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole().name(),
            user.getCreatedAt() != null ? user.getCreatedAt().toString() : null,
            user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : null
        );

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        String username = extractPrincipalName(authentication);
        if (username == null || username.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        User user = userRepository.findByEmailIgnoreCase(username)
            .or(() -> userRepository.findByGoogleSubject(username))
            .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not found"));
        }

        try {
            UserProfileResponse updatedProfile = authService.updateProfile(user, request);
            return ResponseEntity.ok(updatedProfile);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/me/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        String username = extractPrincipalName(authentication);
        if (username == null || username.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        User user = userRepository.findByEmailIgnoreCase(username)
            .or(() -> userRepository.findByGoogleSubject(username))
            .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not found"));
        }

        try {
            authService.changePassword(user, request);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
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
