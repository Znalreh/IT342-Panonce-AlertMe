package com.example.alertme.data.dto

data class AlertCommentResponse(
    val id: String,
    val comment: String,
    val changedByName: String,
    val createdAt: String
)

data class AdminStatsResponse(
    val totalAlerts: Int,
    val activeAlerts: Int,
    val resolvedAlerts: Int,
    val alertsByCategory: Map<String, Int>,
    val alertsByPriority: Map<String, Int>
)