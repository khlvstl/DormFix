package com.vestil.dormfix.mobile

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.gson.Gson
import com.vestil.dormfix.mobile.network.ApiClient
import com.vestil.dormfix.mobile.network.AuthResponse
import com.vestil.dormfix.mobile.network.LoginRequest
import com.vestil.dormfix.mobile.network.RegistrationRequest
import kotlinx.coroutines.launch
import retrofit2.Response

data class AuthUiState(
    val loading: Boolean = false,
    val error: String? = null,
    val user: AuthResponse? = null
)

class AuthViewModel : ViewModel() {
    private val api = ApiClient.userApi
    private val gson = Gson()

    var state by mutableStateOf(AuthUiState())
        private set

    fun clearError() {
        state = state.copy(error = null)
    }

    fun logout() {
        state = AuthUiState()
    }

    fun login(email: String, password: String) {
        viewModelScope.launch {
            state = state.copy(loading = true, error = null)
            try {
                val res = api.login(LoginRequest(email.trim(), password))
                state = reduceAuthResponse(res, defaultFailure = "Login failed")
            } catch (e: Exception) {
                state = state.copy(loading = false, error = e.message ?: "Network error")
            }
        }
    }

    fun register(
        firstName: String,
        lastName: String,
        email: String,
        password: String,
        role: String
    ) {
        viewModelScope.launch {
            state = state.copy(loading = true, error = null)
            try {
                val res = api.register(
                    RegistrationRequest(
                        firstName = firstName.trim(),
                        lastName = lastName.trim(),
                        email = email.trim(),
                        password = password,
                        role = role
                    )
                )
                state = reduceAuthResponse(res, defaultFailure = "Registration failed")
            } catch (e: Exception) {
                state = state.copy(loading = false, error = e.message ?: "Network error")
            }
        }
    }

    private fun reduceAuthResponse(
        res: Response<AuthResponse>,
        defaultFailure: String
    ): AuthUiState {
        val body = res.body()
        if (res.isSuccessful && body != null) {
            return if (body.success) {
                state.copy(loading = false, error = null, user = body)
            } else {
                state.copy(loading = false, error = body.message ?: defaultFailure, user = null)
            }
        }
        val message = parseErrorMessage(res) ?: defaultFailure
        return state.copy(loading = false, error = message, user = null)
    }

    private fun parseErrorMessage(res: Response<AuthResponse>): String? {
        return try {
            val raw = res.errorBody()?.string() ?: return null
            gson.fromJson(raw, AuthResponse::class.java)?.message
        } catch (_: Exception) {
            null
        }
    }
}
