package com.vestil.dormfix.ui

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.vestil.dormfix.R
import com.vestil.dormfix.databinding.ActivityMainBinding
import com.vestil.dormfix.utils.SessionManager

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        SessionManager.init(this)

        // Check if user is already logged in
        if (SessionManager.isLoggedIn()) {
            startActivity(Intent(this, DashboardActivity::class.java))
            finish()
        } else {
            binding.loginBtn.setOnClickListener {
                startActivity(Intent(this, LoginActivity::class.java))
            }

            binding.registerBtn.setOnClickListener {
                startActivity(Intent(this, RegisterActivity::class.java))
            }
        }
    }
}
