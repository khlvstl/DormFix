package com.vestil.dormfix.mobile

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
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

    private val _ui = MutableLiveData(AuthUiState())
    val uiState: LiveData<AuthUiState> = _ui

    private fun current(): AuthUiState = _ui.value ?: AuthUiState()

    fun clearError() {
        _ui.value = current().copy(error = null)
    }

    fun logout() {
        _ui.value = AuthUiState()
    }

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _ui.value = current().copy(loading = true, error = null)
            try {
                val res = api.login(LoginRequest(email.trim(), password))
                _ui.value = reduceAuthResponse(res, defaultFailure = "Login failed")
            } catch (e: Exception) {
                _ui.value = current().copy(loading = false, error = e.message ?: "Network error")
            }
        }
    }

    /**
     * Registers with Phase 1 backend [com.vestil.dormfix.mobile.network.UserApi.register]:
     * POST /api/users/register (assignment examples may say /api/auth/register; this app uses your existing API).
     */
    fun registerWithFullName(fullName: String, email: String, password: String) {
        val parts = fullName.trim().split(Regex("\\s+")).filter { it.isNotEmpty() }
        val rest = parts.drop(1).joinToString(" ")
        if (parts.size < 2 || parts[0].length < 2 || rest.length < 2) {
            _ui.value = current().copy(
                loading = false,
                error = "Enter your first and last name (at least two words, 2+ letters each).",
                user = null
            )
            return
        }
        if (password.length < 6) {
            _ui.value = current().copy(
                loading = false,
                error = "Password must be at least 6 characters.",
                user = null
            )
            return
        }
        register(parts[0], rest, email.trim(), password, "resident")
    }

    private fun register(
        firstName: String,
        lastName: String,
        email: String,
        password: String,
        role: String
    ) {
        viewModelScope.launch {
            _ui.value = current().copy(loading = true, error = null)
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
                _ui.value = reduceAuthResponse(res, defaultFailure = "Registration failed")
            } catch (e: Exception) {
                _ui.value = current().copy(loading = false, error = e.message ?: "Network error")
            }
        }
    }

    private fun reduceAuthResponse(
        res: Response<AuthResponse>,
        defaultFailure: String
    ): AuthUiState {
        val prev = current()
        val body = res.body()
        if (res.isSuccessful && body != null) {
            return if (body.success) {
                prev.copy(loading = false, error = null, user = body)
            } else {
                prev.copy(loading = false, error = body.message ?: defaultFailure, user = null)
            }
        }
        val message = parseErrorMessage(res) ?: defaultFailure
        return prev.copy(loading = false, error = message, user = null)
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
