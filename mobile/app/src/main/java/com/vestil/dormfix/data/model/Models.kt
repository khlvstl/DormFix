package com.vestil.dormfix.data.model

import java.time.LocalDateTime

data class User(
    val id: Long = 0,
    val firstName: String,
    val lastName: String,
    val email: String,
    val role: String,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)

data class RegistrationRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val password: String,
    val role: String = "resident"
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class GoogleLoginRequest(
    val idToken: String
)

data class AuthResponse(
    val id: Long? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val email: String? = null,
    val role: String? = null,
    val message: String,
    val success: Boolean
)

data class MaintenanceRequest(
    val id: Long = 0,
    val title: String,
    val description: String,
    val location: String,
    val status: String,
    val priority: String,
    val userId: Long,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)

data class Comment(
    val id: Long = 0,
    val content: String,
    val userId: Long,
    val maintenanceRequestId: Long,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)

data class Notification(
    val id: Long = 0,
    val message: String,
    val type: String,
    val userId: Long,
    val isRead: Boolean = false,
    val createdAt: LocalDateTime? = null
)
