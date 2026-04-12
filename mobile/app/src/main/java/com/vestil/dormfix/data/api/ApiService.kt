package com.vestil.dormfix.data.api

import com.vestil.dormfix.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // User endpoints
    @POST("users/register")
    suspend fun register(@Body request: RegistrationRequest): Response<AuthResponse>

    @POST("users/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("users/google-login")
    suspend fun googleLogin(@Body request: GoogleLoginRequest): Response<AuthResponse>

    @GET("users/{id}")
    suspend fun getUser(@Path("id") userId: Long): Response<User>

    @GET("users/email/{email}")
    suspend fun getUserByEmail(@Path("email") email: String): Response<User>

    @GET("users")
    suspend fun getAllUsers(): Response<List<User>>

    @PUT("users/{id}")
    suspend fun updateUser(@Path("id") userId: Long, @Body user: User): Response<User>

    // Maintenance Request endpoints
    @GET("maintenance-requests")
    suspend fun getAllMaintenanceRequests(): Response<List<MaintenanceRequest>>

    @GET("maintenance-requests/{id}")
    suspend fun getMaintenanceRequest(@Path("id") requestId: Long): Response<MaintenanceRequest>

    @POST("maintenance-requests")
    suspend fun createMaintenanceRequest(@Body request: MaintenanceRequest): Response<MaintenanceRequest>

    @PUT("maintenance-requests/{id}")
    suspend fun updateMaintenanceRequest(@Path("id") requestId: Long, @Body request: MaintenanceRequest): Response<MaintenanceRequest>

    @DELETE("maintenance-requests/{id}")
    suspend fun deleteMaintenanceRequest(@Path("id") requestId: Long): Response<Void>

    @GET("maintenance-requests/user/{userId}")
    suspend fun getUserMaintenanceRequests(@Path("userId") userId: Long): Response<List<MaintenanceRequest>>

    // Comment endpoints
    @GET("comments")
    suspend fun getAllComments(): Response<List<Comment>>

    @POST("comments")
    suspend fun createComment(@Body comment: Comment): Response<Comment>

    @GET("comments/request/{requestId}")
    suspend fun getCommentsByRequest(@Path("requestId") requestId: Long): Response<List<Comment>>

    @DELETE("comments/{id}")
    suspend fun deleteComment(@Path("id") commentId: Long): Response<Void>

    // Notification endpoints
    @GET("notifications")
    suspend fun getNotifications(): Response<List<Notification>>

    @GET("notifications/{id}")
    suspend fun getNotification(@Path("id") notificationId: Long): Response<Notification>

    @PUT("notifications/{id}/read")
    suspend fun markNotificationAsRead(@Path("id") notificationId: Long): Response<Notification>

    @DELETE("notifications/{id}")
    suspend fun deleteNotification(@Path("id") notificationId: Long): Response<Void>
}
