package com.example.alertme.data.dto

data class ChangePasswordRequest(
    val currentPassword: String,
    val newPassword: String
)
