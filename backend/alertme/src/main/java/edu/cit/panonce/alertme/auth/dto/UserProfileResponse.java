package edu.cit.panonce.alertme.auth.dto;

import java.util.UUID;

public record UserProfileResponse(
    UUID id,
    String email,
    String firstName,
    String lastName,
    String role,
    String createdAt,
    String lastLoginAt
) {
}
