package com.example.alertme.data.models

data class User(
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val role: String, // STUDENT, SECURITY, STAFF, ADMIN
    val isActive: Boolean,
    val createdAt: String? = null,
    val updatedAt: String? = null,
    val lastLoginAt: String? = null
)
