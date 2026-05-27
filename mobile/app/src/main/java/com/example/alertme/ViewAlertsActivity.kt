package com.example.alertme

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.alertme.data.api.RetrofitClient
import com.example.alertme.data.models.Alert
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Locale

class ViewAlertsActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Create a dynamic layout
        val scrollView = ScrollView(this)
        val containerLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }
        
        val titleTextView = TextView(this).apply {
            text = "All Alerts"
            textSize = 24f
            setPadding(16, 16, 16, 16)
        }
        
        val backButton = Button(this).apply {
            text = "Back"
            setPadding(16, 16, 16, 16)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            setOnClickListener {
                startActivity(Intent(this@ViewAlertsActivity, DashboardActivity::class.java))
                finish()
            }
        }
        
        containerLayout.addView(titleTextView)
        scrollView.addView(containerLayout)
        setContentView(scrollView)
        
        // Load alerts
        loadAlerts(containerLayout)
    }

    private fun loadAlerts(container: LinearLayout) {
        lifecycleScope.launch {
            try {
                val apiService = RetrofitClient.getApiService(this@ViewAlertsActivity)
                val alerts = apiService.getAllAlerts()
                
                if (alerts.isEmpty()) {
                    val noAlertsTextView = TextView(this@ViewAlertsActivity).apply {
                        text = "No alerts found"
                        textSize = 16f
                        setPadding(16, 16, 16, 16)
                    }
                    container.addView(noAlertsTextView)
                } else {
                    for (alert in alerts) {
                        val alertView = createAlertView(alert)
                        container.addView(alertView)
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@ViewAlertsActivity,
                    "Failed to load alerts: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun createAlertView(alert: Alert): LinearLayout {
        return LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                setMargins(16, 8, 16, 8)
            }
            
            val categoryTextView = TextView(this@ViewAlertsActivity).apply {
                text = "Category: ${alert.category}"
                textSize = 16f
                setTextColor(android.graphics.Color.BLACK)
            }
            
            val priorityTextView = TextView(this@ViewAlertsActivity).apply {
                text = "Priority: ${alert.priority}"
                textSize = 14f
            }
            
            val statusTextView = TextView(this@ViewAlertsActivity).apply {
                text = "Status: ${alert.status}"
                textSize = 14f
            }
            
            val descriptionTextView = TextView(this@ViewAlertsActivity).apply {
                text = "Description: ${alert.description}"
                textSize = 12f
            }
            
            val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
            val createdAtTextView = TextView(this@ViewAlertsActivity).apply {
                text = "Created: ${alert.createdAt}"
                textSize = 12f
            }
            
            addView(categoryTextView)
            addView(priorityTextView)
            addView(statusTextView)
            addView(descriptionTextView)
            addView(createdAtTextView)
            
            setBackgroundColor(android.graphics.Color.parseColor("#F5F5F5"))
            setPadding(16, 16, 16, 16)
        }
    }
}
