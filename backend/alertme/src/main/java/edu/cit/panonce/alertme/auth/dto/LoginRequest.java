package edu.cit.panonce.alertme.auth.dto;

public record LoginRequest(
    String email,
    String password
) {
}
