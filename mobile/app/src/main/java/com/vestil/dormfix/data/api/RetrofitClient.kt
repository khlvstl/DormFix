package com.vestil.dormfix.data.api

import android.content.Context
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    private var retrofit: Retrofit? = null
    private var apiService: ApiService? = null

    fun init(context: Context) {
        if (retrofit == null) {
            // Logging interceptor for debugging
            val loggingInterceptor = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            // Create OkHttpClient with interceptors
            val okHttpClient = OkHttpClient.Builder()
                .addInterceptor(loggingInterceptor)
                .addInterceptor(AuthInterceptor(context))
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build()

            // Create Gson instance with proper serialization
            val gson = GsonBuilder()
                .setLenient()
                .create()

            // Create Retrofit instance
            retrofit = Retrofit.Builder()
                .baseUrl(com.vestil.dormfix.BuildConfig.API_BASE_URL)
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create(gson))
                .build()

            apiService = retrofit!!.create(ApiService::class.java)
        }
    }

    fun getApiService(): ApiService {
        return apiService ?: throw RuntimeException("RetrofitClient not initialized. Call init() first.")
    }

    fun getRetrofit(): Retrofit {
        return retrofit ?: throw RuntimeException("RetrofitClient not initialized. Call init() first.")
    }
}
