package edu.cit.panonce.alertme.auth;

import edu.cit.panonce.alertme.auth.dto.AuthResponse;
import edu.cit.panonce.alertme.auth.dto.LoginRequest;
import edu.cit.panonce.alertme.auth.dto.RegisterRequest;
import edu.cit.panonce.alertme.config.JwtService;
import edu.cit.panonce.alertme.entity.User;
import edu.cit.panonce.alertme.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final long jwtExpirationMs;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        @Value("${app.jwt.expiration-ms:86400000}") long jwtExpirationMs
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtExpirationMs = jwtExpirationMs;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String firstName = sanitize(request.firstName());
        String lastName = sanitize(request.lastName());
        String email = sanitize(request.email()).toLowerCase(Locale.ROOT);
        String password = request.password();

        if (firstName.isBlank() || lastName.isBlank() || email.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("All required fields must be provided.");
        }

        if (!email.contains("@")) {
            throw new IllegalArgumentException("Please enter a valid email address.");
        }

        if (password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters.");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setRole(parseRole(request.role()));
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setActive(true);

        User savedUser = userRepository.save(user);
        return toAuthResponse(savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = sanitize(request.email()).toLowerCase(Locale.ROOT);
        String password = request.password();

        if (email.isBlank() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Email and password are required.");
        }

        User user = userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!user.isActive()) {
            throw new IllegalStateException("This account is inactive.");
        }

        if (user.getPasswordHash() == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        user.setLastLoginAt(Instant.now());
        User savedUser = userRepository.save(user);

        return toAuthResponse(savedUser);
    }

    @Transactional
    public AuthResponse authenticateWithGoogle(String email, String firstName, String lastName, String googleSubject) {
        String normalizedEmail = sanitize(email).toLowerCase(Locale.ROOT);
        String normalizedGoogleSubject = sanitize(googleSubject);

        if (normalizedEmail.isBlank() || normalizedGoogleSubject.isBlank()) {
            throw new IllegalArgumentException("Google account information is incomplete.");
        }

        User user = userRepository.findByGoogleSubject(normalizedGoogleSubject)
            .or(() -> userRepository.findByEmailIgnoreCase(normalizedEmail))
            .orElseGet(User::new);

        String safeFirstName = sanitize(firstName);
        String safeLastName = sanitize(lastName);
        if (safeFirstName.isBlank()) {
            safeFirstName = "Google";
        }
        if (safeLastName.isBlank()) {
            safeLastName = "User";
        }

        if (user.getId() == null) {
            user.setRole(User.UserRole.STUDENT);
            user.setActive(true);
        }

        user.setEmail(normalizedEmail);
        user.setGoogleSubject(normalizedGoogleSubject);
        user.setFirstName(safeFirstName);
        user.setLastName(safeLastName);
        user.setLastLoginAt(Instant.now());

        User savedUser = userRepository.save(user);
        return toAuthResponse(savedUser);
    }

    private AuthResponse toAuthResponse(User user) {
        String accessToken = jwtService.generateToken(user);
        long expiresAt = Instant.now().plusMillis(jwtExpirationMs).toEpochMilli();

        return new AuthResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole().name(),
            accessToken,
            "Bearer",
            expiresAt
        );
    }

    private User.UserRole parseRole(String role) {
        if (role == null || role.isBlank()) {
            return User.UserRole.STUDENT;
        }

        try {
            return User.UserRole.valueOf(role.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Unsupported role selected.");
        }
    }

    private String sanitize(String value) {
        return value == null ? "" : value.trim();
    }
}
