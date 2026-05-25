package edu.cit.panonce.alertme.auth;

import edu.cit.panonce.alertme.auth.dto.AuthResponse;
import edu.cit.panonce.alertme.auth.dto.LoginRequest;
import edu.cit.panonce.alertme.auth.dto.RegisterRequest;
import edu.cit.panonce.alertme.config.JwtService;
import edu.cit.panonce.alertme.user.entity.User;
import edu.cit.panonce.alertme.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtService, 86400000L);
    }

    @Test
    void register_createsNewUserAndReturnsAuthResponse() {
        RegisterRequest request = new RegisterRequest("Alice", "Chen", "alice@example.com", "password123", "STUDENT");
        when(userRepository.existsByEmailIgnoreCase("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");

        User savedUser = new User();
        UUID userId = UUID.randomUUID();
        savedUser.setId(userId);
        savedUser.setEmail("alice@example.com");
        savedUser.setFirstName("Alice");
        savedUser.setLastName("Chen");
        savedUser.setRole(User.UserRole.STUDENT);
        savedUser.setPasswordHash("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(savedUser)).thenReturn("token-value");

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.email()).isEqualTo("alice@example.com");
        assertThat(response.firstName()).isEqualTo("Alice");
        assertThat(response.role()).isEqualTo("STUDENT");
        assertThat(response.accessToken()).isEqualTo("token-value");
        verify(userRepository).existsByEmailIgnoreCase("alice@example.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_throwsWhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest("Bob", "Miller", "bob@example.com", "password123", "STUDENT");
        when(userRepository.existsByEmailIgnoreCase("bob@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("An account with this email already exists.");

        verify(userRepository).existsByEmailIgnoreCase("bob@example.com");
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_returnsAuthResponseWhenCredentialsAreValid() {
        LoginRequest request = new LoginRequest("student@example.com", "secure123");
        User existingUser = new User();
        existingUser.setId(UUID.randomUUID());
        existingUser.setEmail("student@example.com");
        existingUser.setPasswordHash("encodedPassword");
        existingUser.setActive(true);
        existingUser.setRole(User.UserRole.STUDENT);
        when(userRepository.findByEmailIgnoreCase("student@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("secure123", "encodedPassword")).thenReturn(true);
        when(userRepository.save(existingUser)).thenReturn(existingUser);
        when(jwtService.generateToken(existingUser)).thenReturn("token-value");

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.accessToken()).isEqualTo("token-value");
        assertThat(response.email()).isEqualTo("student@example.com");
        verify(userRepository).findByEmailIgnoreCase("student@example.com");
        verify(passwordEncoder).matches("secure123", "encodedPassword");
        verify(userRepository).save(existingUser);
    }

    @Test
    void login_throwsWhenPasswordDoesNotMatch() {
        LoginRequest request = new LoginRequest("student@example.com", "wrong-password");
        User existingUser = new User();
        existingUser.setEmail("student@example.com");
        existingUser.setPasswordHash("encodedPassword");
        existingUser.setActive(true);
        when(userRepository.findByEmailIgnoreCase("student@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("wrong-password", "encodedPassword")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Invalid email or password.");

        verify(userRepository).findByEmailIgnoreCase("student@example.com");
        verify(passwordEncoder).matches("wrong-password", "encodedPassword");
    }

    @Test
    void authenticateWithGoogle_createsOrUpdatesUserWithGoogleSubject() {
        String email = "google.user@example.com";
        String googleSubject = "google-123";
        when(userRepository.findByGoogleSubject(googleSubject)).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase(email)).thenReturn(Optional.empty());

        User savedUser = new User();
        UUID userId = UUID.randomUUID();
        savedUser.setId(userId);
        savedUser.setEmail(email);
        savedUser.setGoogleSubject(googleSubject);
        savedUser.setFirstName("Google");
        savedUser.setLastName("User");
        savedUser.setRole(User.UserRole.STUDENT);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("token-value");

        AuthResponse response = authService.authenticateWithGoogle(email, "Test", "User", googleSubject);

        assertThat(response).isNotNull();
        assertThat(response.email()).isEqualTo(email);
        assertThat(response.accessToken()).isEqualTo("token-value");
        verify(userRepository).findByGoogleSubject(googleSubject);
        verify(userRepository).findByEmailIgnoreCase(email);
        verify(userRepository).save(any(User.class));
    }
}
