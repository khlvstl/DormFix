package com.vestil.dormfix.mobile.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

/**
 * Phase 1 DormFix user endpoints; base URL is `BuildConfig.API_BASE_URL` in the app module.
 * Specs often show `/api/auth/login`; this backend uses `/api/users/login` and `/api/users/register`.
 */
interface UserApi {
    @POST("api/users/login")
    suspend fun login(@Body body: LoginRequest): Response<AuthResponse>

    @POST("api/users/register")
    suspend fun register(@Body body: RegistrationRequest): Response<AuthResponse>
}
