package com.vestil.dormfix.utils

import android.content.Context
import android.content.SharedPreferences

object SessionManager {
    private const val PREFS_NAME = "dormfix_prefs"
    private const val KEY_USER_ID = "user_id"
    private const val KEY_EMAIL = "email"
    private const val KEY_NAME = "name"
    private const val KEY_ROLE = "role"
    private const val KEY_AUTH_TOKEN = "auth_token"
    private const val KEY_IS_LOGGED_IN = "is_logged_in"

    private lateinit var prefs: SharedPreferences

    fun init(context: Context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun saveSession(userId: Long, email: String, name: String, role: String) {
        val editor = prefs.edit()
        editor.apply {
            putLong(KEY_USER_ID, userId)
            putString(KEY_EMAIL, email)
            putString(KEY_NAME, name)
            putString(KEY_ROLE, role)
            putBoolean(KEY_IS_LOGGED_IN, true)
            apply()
        }
    }

    fun saveAuthToken(token: String) {
        prefs.edit().apply {
            putString(KEY_AUTH_TOKEN, token)
            apply()
        }
    }

    fun getAuthToken(): String? = prefs.getString(KEY_AUTH_TOKEN, null)

    fun getUserId(): Long = prefs.getLong(KEY_USER_ID, -1)

    fun getEmail(): String? = prefs.getString(KEY_EMAIL, null)

    fun getName(): String? = prefs.getString(KEY_NAME, null)

    fun getRole(): String? = prefs.getString(KEY_ROLE, null)

    fun isLoggedIn(): Boolean = prefs.getBoolean(KEY_IS_LOGGED_IN, false)

    fun clearSession() {
        prefs.edit().apply {
            clear()
            apply()
        }
    }
}
