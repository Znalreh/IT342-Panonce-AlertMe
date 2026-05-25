package edu.cit.panonce.alertme.auth.dto;

public record ChangePasswordRequest(
    String currentPassword,
    String newPassword
) {
}
