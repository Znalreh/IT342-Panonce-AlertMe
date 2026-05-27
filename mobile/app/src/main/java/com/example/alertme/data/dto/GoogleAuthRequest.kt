package com.example.alertme.data.dto

data class GoogleAuthRequest(
    val idToken: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val googleSubject: String
)
