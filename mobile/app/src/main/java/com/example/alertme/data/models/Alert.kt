package com.example.alertme.data.models

data class Alert(
    val id: String,
    val title: String?,
    val category: String,
    val priority: String, // LOW, MEDIUM, HIGH
    val status: String, // RECEIVED, INVESTIGATING, RESOLVED
    val description: String,
    val locationText: String?,
    val latitude: Double?,
    val longitude: Double?,
    val geocodedAddress: String?,
    val reporter: User?,
    val assignedTo: User?,
    val mediaAttachments: List<AlertMedia>? = null,
    val statusHistory: List<AlertStatusHistory>? = null,
    val createdAt: String,
    val updatedAt: String,
    val resolvedAt: String? = null
)

data class AlertMedia(
    val id: String,
    val mediaType: String, // PHOTO, VIDEO
    val mimeType: String,
    val storageKey: String,
    val originalFilename: String,
    val fileSizeBytes: Long,
    val uploadedBy: String? = null,
    val createdAt: String? = null
)

data class AlertStatusHistory(
    val id: String? = null,
    val fromStatus: String? = null,
    val toStatus: String? = null,
    val comment: String? = null,
    val changedByName: String? = null,
    val createdAt: String? = null
)
