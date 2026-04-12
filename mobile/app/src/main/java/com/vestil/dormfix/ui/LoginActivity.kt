package com.vestil.dormfix.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.vestil.dormfix.databinding.ActivityLoginBinding
import com.vestil.dormfix.data.model.LoginRequest
import com.vestil.dormfix.data.repository.AuthRepository
import com.vestil.dormfix.utils.SessionManager
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding
    private val authRepository = AuthRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.loginBtn.setOnClickListener {
            performLogin()
        }

        binding.registerLink.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
            finish()
        }
    }

    private fun performLogin() {
        val email = binding.emailInput.text.toString().trim()
        val password = binding.passwordInput.text.toString()

        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
            return
        }

        binding.loginBtn.isEnabled = false
        binding.loginBtn.text = "Logging in..."

        lifecycleScope.launch {
            val result = authRepository.login(LoginRequest(email, password))
            result.onSuccess { response ->
                if (response.success) {
                    response.id?.let { userId ->
                        SessionManager.saveSession(
                            userId, 
                            response.email ?: email,
                            "${response.firstName} ${response.lastName}",
                            response.role ?: "resident"
                        )
                        Toast.makeText(this@LoginActivity, "Login successful", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this@LoginActivity, DashboardActivity::class.java))
                        finish()
                    }
                } else {
                    Toast.makeText(this@LoginActivity, response.message, Toast.LENGTH_SHORT).show()
                }
            }
            result.onFailure { exception ->
                binding.loginBtn.isEnabled = true
                binding.loginBtn.text = "Login"
                Toast.makeText(this@LoginActivity, "Login failed: ${exception.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
