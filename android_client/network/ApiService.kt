package com.orcare.client.network

import com.orcare.client.models.AuthResponse
import com.orcare.client.models.LoginRequest
import com.orcare.client.models.RegisterRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT

interface ApiService {
    @POST("api/auth/register")
    suspend fun register(@Body req: RegisterRequest): Response<AuthResponse>

    @POST("api/auth/login")
    suspend fun login(@Body credentials: LoginRequest): Response<AuthResponse>

    @POST("api/auth/forgot-password")
    suspend fun forgotPassword(@Body body: Map<String, String>): Response<Map<String, String>>

    @POST("api/auth/verify-otp")
    suspend fun verifyOtp(@Body body: Map<String, String>): Response<Map<String, Any>>

    @POST("api/auth/reset-password")
    suspend fun resetPassword(@Body body: Map<String, String>): Response<Map<String, String>>

    @GET("api/users/profile")
    suspend fun getProfile(): Response<AuthResponse>

    @PUT("api/users/profile")
    suspend fun updateProfile(@Body body: Map<String, Any>): Response<AuthResponse>
}
