package com.vestil.dormfix.ui

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.vestil.dormfix.databinding.ActivityRegisterBinding
import com.vestil.dormfix.data.model.RegistrationRequest
import com.vestil.dormfix.data.repository.AuthRepository
import com.vestil.dormfix.utils.SessionManager
import kotlinx.coroutines.launch

class RegisterActivity : AppCompatActivity() {
    private lateinit var binding: ActivityRegisterBinding
    private val authRepository = AuthRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.registerBtn.setOnClickListener {
            performRegistration()
        }

        binding.loginLink.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }

    private fun performRegistration() {
        val firstName = binding.firstNameInput.text.toString().trim()
        val lastName = binding.lastNameInput.text.toString().trim()
        val email = binding.emailInput.text.toString().trim()
        val password = binding.passwordInput.text.toString()
        val confirmPassword = binding.confirmPasswordInput.text.toString()

        if (firstName.isEmpty() || lastName.isEmpty() || email.isEmpty() || 
            password.isEmpty() || confirmPassword.isEmpty()) {
            Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
            return
        }

        if (password != confirmPassword) {
            Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
            return
        }

        if (password.length < 6) {
            Toast.makeText(this, "Password must be at least 6 characters", Toast.LENGTH_SHORT).show()
            return
        }

        binding.registerBtn.isEnabled = false
        binding.registerBtn.text = "Registering..."

        lifecycleScope.launch {
            val result = authRepository.register(
                RegistrationRequest(firstName, lastName, email, password, "resident")
            )
            result.onSuccess { response ->
                if (response.success) {
                    response.id?.let { userId ->
                        SessionManager.saveSession(
                            userId,
                            response.email ?: email,
                            "$firstName $lastName",
                            response.role ?: "resident"
                        )
                        Toast.makeText(this@RegisterActivity, "Registration successful", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this@RegisterActivity, DashboardActivity::class.java))
                        finish()
                    }
                } else {
                    Toast.makeText(this@RegisterActivity, response.message, Toast.LENGTH_SHORT).show()
                }
            }
            result.onFailure { exception ->
                binding.registerBtn.isEnabled = true
                binding.registerBtn.text = "Register"
                Toast.makeText(this@RegisterActivity, "Registration failed: ${exception.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
