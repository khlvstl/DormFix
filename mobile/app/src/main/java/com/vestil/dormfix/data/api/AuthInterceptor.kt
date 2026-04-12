package com.vestil.dormfix.data.api

import android.content.Context
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val context: Context) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        
        // Skip adding token for login/register endpoints
        if (originalRequest.url.encodedPath.contains("/register") || 
            originalRequest.url.encodedPath.contains("/login") ||
            originalRequest.url.encodedPath.contains("/google-login")) {
            return chain.proceed(originalRequest)
        }

        // Get auth token from SharedPreferences
        val sharedPrefs = context.getSharedPreferences("dormfix_prefs", Context.MODE_PRIVATE)
        val authToken = sharedPrefs.getString("auth_token", null)

        val requestBuilder = originalRequest.newBuilder()
        
        // Add authorization header if token exists
        if (!authToken.isNullOrEmpty()) {
            requestBuilder.addHeader("Authorization", "Bearer $authToken")
        }
        
        // Add common headers
        requestBuilder.addHeader("Content-Type", "application/json")

        return chain.proceed(requestBuilder.build())
    }
}
