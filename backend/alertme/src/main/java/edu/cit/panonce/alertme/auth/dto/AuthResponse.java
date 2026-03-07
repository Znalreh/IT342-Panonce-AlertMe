package edu.cit.panonce.alertme.auth.dto;

import java.util.UUID;

public record AuthResponse(
    UUID id,
    String email,
    String firstName,
    String lastName,
    String role,
    String accessToken,
    String tokenType,
    long expiresAt
) {
}
