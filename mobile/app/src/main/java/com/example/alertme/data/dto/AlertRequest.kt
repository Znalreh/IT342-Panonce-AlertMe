package com.example.alertme.data.dto

data class CreateAlertRequest(
    val category: String,
    val priority: String, // LOW, MEDIUM, HIGH
    val description: String,
    val locationText: String?,
    val latitude: Double?,
    val longitude: Double?
)

data class UpdateAlertStatusRequest(
    val status: String,
    val comment: String? = null
)

data class AddCommentRequest(
    val comment: String
)

data class AssignAlertRequest(
    val userId: String
)
