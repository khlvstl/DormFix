package com.vestil.dormfix.mobile.network

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegistrationRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val password: String,
    val role: String
)

data class AuthResponse(
    val id: Long? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val email: String? = null,
    val role: String? = null,
    val message: String? = null,
    val success: Boolean = false
)
