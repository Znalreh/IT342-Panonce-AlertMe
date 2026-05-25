package edu.cit.panonce.alertme.config;

import edu.cit.panonce.alertme.user.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    @Test
    void generateToken_extractsUsernameAndValidatesSuccessfully() {
        JwtService jwtService = new JwtService("test-secret", 3600000L);
        User user = new User();
        user.setEmail("jane@example.com");
        user.setRole(User.UserRole.STUDENT);

        String token = jwtService.generateToken(user);
        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("jane@example.com");

        UserDetails userDetails = org.springframework.security.core.userdetails.User.withUsername("jane@example.com").password("irrelevant").roles("STUDENT").build();
        assertThat(jwtService.isTokenValid(token, userDetails)).isTrue();
        assertThat(jwtService.extractExpiration(token)).isAfter(Instant.now());
    }

    @Test
    void isTokenValid_returnsFalseForExpiredToken() {
        JwtService jwtService = new JwtService("test-secret", -1000L);
        User user = new User();
        user.setEmail("jane@example.com");
        user.setRole(User.UserRole.STUDENT);

        String token = jwtService.generateToken(user);
        UserDetails userDetails = org.springframework.security.core.userdetails.User.withUsername("jane@example.com").password("irrelevant").roles("STUDENT").build();

        assertThat(jwtService.isTokenValid(token, userDetails)).isFalse();
    }

    @Test
    void parseAndValidate_throwsWhenTokenIsMalformed() {
        JwtService jwtService = new JwtService("test-secret", 3600000L);

        assertThatThrownBy(() -> jwtService.extractUsername("bad-token"))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void isTokenValid_throwsWhenSignatureIsInvalid() {
        JwtService jwtService = new JwtService("test-secret", 3600000L);
        User user = new User();
        user.setEmail("jane@example.com");
        user.setRole(User.UserRole.STUDENT);

        String token = jwtService.generateToken(user);
        String[] parts = token.split("\\.");
        String alteredPayload = parts[1].substring(0, parts[1].length() - 1) + (parts[1].endsWith("A") ? "B" : "A");
        String tampered = parts[0] + "." + alteredPayload + "." + parts[2];

        UserDetails userDetails = org.springframework.security.core.userdetails.User.withUsername("jane@example.com").password("irrelevant").roles("STUDENT").build();
        assertThatThrownBy(() -> jwtService.isTokenValid(tampered, userDetails))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
