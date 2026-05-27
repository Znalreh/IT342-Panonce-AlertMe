package com.example.alertme.data.dto

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val password: String,
    val role: String
)

data class AuthResponse(
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val role: String,
    val accessToken: String,
    val tokenType: String = "Bearer",
    val expiresAt: Long
)
