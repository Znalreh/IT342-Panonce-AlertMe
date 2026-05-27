package com.example.alertme

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import android.widget.Spinner
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.alertme.data.api.RetrofitClient
import com.example.alertme.data.models.Alert
import kotlinx.coroutines.launch
import java.util.Locale

class BrowseAlertsActivity : AppCompatActivity() {

    private lateinit var searchInput: EditText
    private lateinit var searchButton: Button
    private lateinit var statusFilter: Spinner
    private lateinit var categoryFilter: Spinner
    private lateinit var priorityFilter: Spinner
    private lateinit var filterAllButton: Button
    private lateinit var filterHighPriorityButton: Button
    private lateinit var filterNewButton: Button
    private lateinit var filterResolvedButton: Button
    private lateinit var filterSecurityButton: Button
    private lateinit var filterInfrastructureButton: Button
    private lateinit var filterEnvironmentalButton: Button
    private lateinit var alertsCountView: TextView
    private lateinit var recyclerView: RecyclerView

    private var allAlerts: List<Alert> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_browse_alerts)

        searchInput = findViewById(R.id.searchInput)
        searchButton = findViewById(R.id.searchButton)
        statusFilter = findViewById(R.id.statusFilter)
        categoryFilter = findViewById(R.id.categoryFilter)
        priorityFilter = findViewById(R.id.priorityFilter)
        filterAllButton = findViewById(R.id.filterAll)
        filterHighPriorityButton = findViewById(R.id.filterHighPriority)
        filterNewButton = findViewById(R.id.filterNew)
        filterResolvedButton = findViewById(R.id.filterResolved)
        filterSecurityButton = findViewById(R.id.filterSecurity)
        filterInfrastructureButton = findViewById(R.id.filterInfrastructure)
        filterEnvironmentalButton = findViewById(R.id.filterEnvironmental)
        alertsCountView = findViewById(R.id.alertsCount)
        recyclerView = findViewById(R.id.rvBrowseAlerts)
        recyclerView.layoutManager = LinearLayoutManager(this)

        setupFilters()
        loadAlerts()
    }

    private fun loadAlerts() {
        lifecycleScope.launch {
            try {
                val apiService = RetrofitClient.getApiService(this@BrowseAlertsActivity)
                val alerts = apiService.getAllAlerts()
                allAlerts = alerts
                applyFilters()
            } catch (e: Exception) {
                Toast.makeText(
                    this@BrowseAlertsActivity,
                    "Failed to load alerts: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun setupFilters() {
        val statusOptions = listOf("All Statuses", "RECEIVED", "INVESTIGATING", "RESOLVED")
        val categoryOptions = listOf("All Categories", "Security", "Infrastructure", "Environmental", "Academic", "Health", "Other")
        val priorityOptions = listOf("All Priorities", "HIGH", "MEDIUM", "LOW")

        statusFilter.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, statusOptions).also {
            it.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        }
        categoryFilter.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, categoryOptions).also {
            it.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        }
        priorityFilter.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, priorityOptions).also {
            it.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        }

        val listener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>, view: View?, position: Int, id: Long) {
                applyFilters()
            }

            override fun onNothingSelected(parent: AdapterView<*>) {}
        }

        statusFilter.onItemSelectedListener = listener
        categoryFilter.onItemSelectedListener = listener
        priorityFilter.onItemSelectedListener = listener

        searchButton.setOnClickListener { applyFilters() }
        searchInput.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                applyFilters()
                true
            } else {
                false
            }
        }

        filterAllButton.setOnClickListener {
            searchInput.text?.clear()
            statusFilter.setSelection(statusOptions.indexOf("All Statuses"))
            categoryFilter.setSelection(categoryOptions.indexOf("All Categories"))
            priorityFilter.setSelection(priorityOptions.indexOf("All Priorities"))
            applyFilters()
        }

        filterHighPriorityButton.setOnClickListener {
            priorityFilter.setSelection(priorityOptions.indexOf("HIGH"))
            applyFilters()
        }

        filterNewButton.setOnClickListener {
            statusFilter.setSelection(statusOptions.indexOf("RECEIVED"))
            applyFilters()
        }

        filterResolvedButton.setOnClickListener {
            statusFilter.setSelection(statusOptions.indexOf("RESOLVED"))
            applyFilters()
        }

        filterSecurityButton.setOnClickListener {
            categoryFilter.setSelection(categoryOptions.indexOf("Security"))
            applyFilters()
        }

        filterInfrastructureButton.setOnClickListener {
            categoryFilter.setSelection(categoryOptions.indexOf("Infrastructure"))
            applyFilters()
        }

        filterEnvironmentalButton.setOnClickListener {
            categoryFilter.setSelection(categoryOptions.indexOf("Environmental"))
            applyFilters()
        }
    }

    private fun applyFilters() {
        val query = searchInput.text?.toString()?.trim()?.lowercase(Locale.getDefault()).orEmpty()
        val selectedStatus = statusFilter.selectedItem?.toString() ?: "All Statuses"
        val selectedCategory = categoryFilter.selectedItem?.toString() ?: "All Categories"
        val selectedPriority = priorityFilter.selectedItem?.toString() ?: "All Priorities"

        val filteredAlerts = allAlerts.filter { alert ->
            val searchableText = listOf(
                alert.title ?: "",
                alert.description,
                alert.locationText ?: alert.geocodedAddress ?: "",
                alert.category,
                alert.priority,
                alert.status
            ).joinToString(" ").lowercase(Locale.getDefault())

            val matchesSearch = query.isBlank() || searchableText.contains(query)
            val matchesStatus = selectedStatus == "All Statuses" || alert.status.equals(selectedStatus, ignoreCase = true)
            val matchesCategory = selectedCategory == "All Categories" || alert.category.equals(selectedCategory, ignoreCase = true)
            val matchesPriority = selectedPriority == "All Priorities" || alert.priority.equals(selectedPriority, ignoreCase = true)

            matchesSearch && matchesStatus && matchesCategory && matchesPriority
        }

        alertsCountView.text = "Showing ${filteredAlerts.size} alerts"
        recyclerView.adapter = AlertAdapter(filteredAlerts) { alert ->
            val intent = Intent(this@BrowseAlertsActivity, AlertDetailActivity::class.java)
            intent.putExtra(AlertDetailActivity.EXTRA_ALERT_ID, alert.id)
            startActivity(intent)
        }
    }
}
