package com.vestil.dormfix.ui

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.vestil.dormfix.databinding.ActivityDashboardBinding
import com.vestil.dormfix.data.repository.MaintenanceRequestRepository
import com.vestil.dormfix.utils.SessionManager
import kotlinx.coroutines.launch

class DashboardActivity : AppCompatActivity() {
    private lateinit var binding: ActivityDashboardBinding
    private val maintenanceRepository = MaintenanceRequestRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.tvWelcome.text = "Welcome, ${SessionManager.getName()}"

        binding.btnCreateRequest.setOnClickListener {
            // TODO: Open create maintenance request activity
        }

        binding.btnViewRequests.setOnClickListener {
            // TODO: Open view maintenance requests activity
        }

        binding.btnViewNotifications.setOnClickListener {
            // TODO: Open notifications activity
        }

        binding.btnLogout.setOnClickListener {
            SessionManager.clearSession()
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }

        loadMaintenanceRequests()
    }

    private fun loadMaintenanceRequests() {
        lifecycleScope.launch {
            val result = maintenanceRepository.getUserMaintenanceRequests(SessionManager.getUserId())
            result.onSuccess { requests ->
                binding.tvRequestCount.text = "You have ${requests.size} maintenance requests"
            }
            result.onFailure { exception ->
                binding.tvRequestCount.text = "Error loading requests: ${exception.message}"
            }
        }
    }
}
