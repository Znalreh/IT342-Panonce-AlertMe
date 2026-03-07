package edu.cit.panonce.alertme.auth.dto;

public record RegisterRequest(
    String firstName,
    String lastName,
    String email,
    String password,
    String role
) {
}
