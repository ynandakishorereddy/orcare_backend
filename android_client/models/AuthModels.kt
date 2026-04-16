package com.orcare.client.models

data class RegisterRequest(
    val name: String,
    val age: Int?,
    val gender: String?,
    val phone: String?,
    val email: String,
    val password: String
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class AuthResponse(
    val _id: String,
    val name: String,
    val email: String,
    val phone: String?,
    val age: Int?,
    val gender: String?,
    val state: String?,
    val district: String?,
    val profileImage: String?,
    val token: String
)
