package com.example.alertme

import android.content.Intent
import android.os.Bundle
import android.widget.ImageButton
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.alertme.data.api.RetrofitClient
import com.example.alertme.data.api.AlertWebSocketClient
import com.example.alertme.data.models.Alert
import com.example.alertme.data.preferences.TokenManager
import com.google.android.material.button.MaterialButton
import com.google.android.material.floatingactionbutton.FloatingActionButton
import kotlinx.coroutines.launch

class DashboardActivity : AppCompatActivity() {

    private val alertWsClient = AlertWebSocketClient()
    private val wsListener: (AlertWebSocketClient.AlertStatusUpdate) -> Unit = { _ ->
        runOnUiThread { loadDashboardData() }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_dashboard)

        val fabReportAlert = findViewById<FloatingActionButton>(R.id.fabReportAlert)
        val viewAllAlertsButton = findViewById<MaterialButton>(R.id.btnViewAllAlerts)
        val profileButton = findViewById<ImageButton>(R.id.btnProfile)
        val rvAlerts = findViewById<RecyclerView>(R.id.rvAlerts)
        
        // Set up RecyclerView (you'll need to create an adapter)
        rvAlerts.layoutManager = LinearLayoutManager(this)

        fabReportAlert.setOnClickListener {
            startActivity(Intent(this, ReportAlertActivity::class.java))
        }

        viewAllAlertsButton.setOnClickListener {
            startActivity(Intent(this, BrowseAlertsActivity::class.java))
        }

        profileButton.setOnClickListener {
            try {
                Toast.makeText(this, "Opening profile...", Toast.LENGTH_SHORT).show()
                val intent = Intent(this@DashboardActivity, ProfileActivity::class.java)
                startActivity(intent)
            } catch (e: Exception) {
                Toast.makeText(this, "Could not open profile: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }

        // Load dashboard data
        loadDashboardData()
    }

    override fun onResume() {
        super.onResume()
        try {
            alertWsClient.addListener(wsListener)
            alertWsClient.start(this)
        } catch (_: Exception) {
        }
    }

    override fun onPause() {
        super.onPause()
        try {
            alertWsClient.removeListener(wsListener)
            alertWsClient.stop()
        } catch (_: Exception) {
        }
    }

    private fun loadDashboardData() {
        lifecycleScope.launch {
            try {
                val apiService = RetrofitClient.getApiService(this@DashboardActivity)
                val user = apiService.getCurrentUser()
                val alerts = apiService.getAllAlerts()

                // Update stats if available
                updateStats(alerts)
                
                val recentAlerts = alerts.take(3)
                val rvAlerts = findViewById<androidx.recyclerview.widget.RecyclerView>(R.id.rvAlerts)
                rvAlerts.adapter = AlertAdapter(recentAlerts) { alert ->
                    openAlertDetail(alert.id)
                }

                Toast.makeText(
                    this@DashboardActivity,
                    "Welcome, ${user.firstName}!",
                    Toast.LENGTH_SHORT
                ).show()
            } catch (e: Exception) {
                Toast.makeText(
                    this@DashboardActivity,
                    "Failed to load data: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }
    
    private fun openAlertDetail(alertId: String) {
        val intent = Intent(this, AlertDetailActivity::class.java)
        intent.putExtra(AlertDetailActivity.EXTRA_ALERT_ID, alertId)
        startActivity(intent)
    }
    
    private fun updateStats(alerts: List<Alert>) {
        val tvTotalAlerts = findViewById<android.widget.TextView>(R.id.tvTotalAlerts)
        val tvActiveAlerts = findViewById<android.widget.TextView>(R.id.tvActiveAlerts)
        val tvResolvedAlerts = findViewById<android.widget.TextView>(R.id.tvResolvedAlerts)
        val tvHighPriorityAlerts = findViewById<android.widget.TextView>(R.id.tvHighPriorityAlerts)
        
        tvTotalAlerts.text = alerts.size.toString()
        
        val activeCount = alerts.count { it.status != "RESOLVED" }
        tvActiveAlerts.text = activeCount.toString()
        
        val resolvedCount = alerts.count { it.status == "RESOLVED" }
        tvResolvedAlerts.text = resolvedCount.toString()
        
        val highPriorityCount = alerts.count { it.priority == com.example.alertme.config.AppConfig.Alert.Priorities.HIGH }
        tvHighPriorityAlerts.text = highPriorityCount.toString()
    }
    
    private fun performLogout() {
        lifecycleScope.launch {
            TokenManager.clearToken(this@DashboardActivity)
            RetrofitClient.resetClient()
            startActivity(Intent(this@DashboardActivity, LoginActivity::class.java))
            finish()
        }
    }
}
