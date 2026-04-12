package com.vestil.dormfix.mobile.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface UserApi {
    @POST("api/users/login")
    suspend fun login(@Body body: LoginRequest): Response<AuthResponse>

    @POST("api/users/register")
    suspend fun register(@Body body: RegistrationRequest): Response<AuthResponse>
}
