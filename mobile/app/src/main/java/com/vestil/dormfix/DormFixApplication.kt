package com.vestil.dormfix

import android.app.Application
import com.vestil.dormfix.data.api.RetrofitClient

class DormFixApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize Retrofit client
        RetrofitClient.init(this)
    }
}
