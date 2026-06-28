package com.example.orcare.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.DELETE

data class GoogleLoginRequest(
    val idToken: String,
    val language: String = "English"
)

data class AuthResponse(
    val success: Boolean,
    val message: String?,
    val token: String?,
    // Add user fields as needed
)

interface ApiService {

    // Authentication
    @POST("api/auth/google")
    suspend fun googleLogin(@Body request: GoogleLoginRequest): Response<AuthResponse>

    @GET("api/auth/me")
    suspend fun getCurrentUser(): Response<AuthResponse>

    // Profile
    @PUT("api/user/profile")
    suspend fun updateProfile(@Body profileData: Any): Response<Any>

    @DELETE("api/user")
    suspend fun deleteAccount(): Response<Any>

    // Health and Version
    @GET("api/health")
    suspend fun getHealth(): Response<Any>

    @GET("api/version")
    suspend fun getVersion(): Response<Any>

    // Other Endpoints (Chat, Quiz, Content) would go here...
}
