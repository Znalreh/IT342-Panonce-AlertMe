package com.example.alertme

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.alertme.data.api.RetrofitClient
import com.example.alertme.data.api.AlertWebSocketClient
import com.example.alertme.data.dto.ChangePasswordRequest
import com.example.alertme.data.dto.UpdateProfileRequest
import com.example.alertme.data.models.Alert
import com.example.alertme.data.preferences.TokenManager
import com.example.alertme.util.AlertNotifier
import com.google.android.material.button.MaterialButton
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.launch

class ProfileActivity : AppCompatActivity() {

    private lateinit var tvUserName: android.widget.TextView
    private lateinit var tvUserEmail: android.widget.TextView
    private lateinit var tvReportsCount: android.widget.TextView
    private lateinit var tvActiveCount: android.widget.TextView
    private lateinit var tvResolvedCount: android.widget.TextView
    private lateinit var etFirstName: TextInputEditText
    private lateinit var etLastName: TextInputEditText
    private lateinit var etEmail: TextInputEditText
    private lateinit var btnSave: MaterialButton
    private lateinit var btnCancel: MaterialButton
    private lateinit var btnChangePassword: MaterialButton
    private lateinit var btnLogout: MaterialButton
    private lateinit var btnBack: ImageView
    private val refreshHandler = Handler(Looper.getMainLooper())
    private val refreshRunnable = object : Runnable {
        override fun run() {
            loadProfile()
            refreshHandler.postDelayed(this, 10_000)
        }
    }

    private val alertWsClient = AlertWebSocketClient()
    private val wsListener: (AlertWebSocketClient.AlertStatusUpdate) -> Unit = { update ->
        if (update.eventType.equals("ALERT_CREATED", ignoreCase = true)) {
            AlertNotifier.notifyNewAlert(this, update.alertId, update.alertTitle)
        }
        runOnUiThread { loadProfile() }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)

        try {
            initializeViews()
            setupListeners()
            loadProfile()
        } catch (e: Exception) {
            Toast.makeText(this, "Init error: ${e.message}", Toast.LENGTH_LONG).show()
            finish()
        }
    }

    override fun onResume() {
        super.onResume()
        loadProfile()
        refreshHandler.postDelayed(refreshRunnable, 10_000)
        try {
            alertWsClient.addListener(wsListener)
            alertWsClient.start(this)
        } catch (_: Exception) {
        }
    }

    override fun onPause() {
        super.onPause()
        refreshHandler.removeCallbacks(refreshRunnable)
        try {
            alertWsClient.removeListener(wsListener)
            alertWsClient.stop()
        } catch (_: Exception) {
        }
    }

    private fun initializeViews() {
        btnBack = findViewById(R.id.btnBack)
        tvUserName = findViewById(R.id.tvUserName)
        tvUserEmail = findViewById(R.id.tvUserEmail)
        tvReportsCount = findViewById(R.id.tvReportsCount)
        tvActiveCount = findViewById(R.id.tvActiveCount)
        tvResolvedCount = findViewById(R.id.tvResolvedCount)
        etFirstName = findViewById(R.id.etFirstName)
        etLastName = findViewById(R.id.etLastName)
        etEmail = findViewById(R.id.etEmail)
        btnSave = findViewById(R.id.btnSaveChanges)
        btnCancel = findViewById(R.id.btnCancel)
        btnChangePassword = findViewById(R.id.btnChangePassword)
        btnLogout = findViewById(R.id.btnLogout)
    }

    private fun setupListeners() {
        btnBack.setOnClickListener { finish() }

        btnSave.setOnClickListener {
            val firstName = etFirstName.text?.toString()?.trim() ?: ""
            val lastName = etLastName.text?.toString()?.trim() ?: ""

            if (firstName.isBlank() || lastName.isBlank()) {
                Toast.makeText(this, "Please provide first and last name.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                try {
                    val api = RetrofitClient.getApiService(this@ProfileActivity)
                    val updated = api.updateProfile(UpdateProfileRequest(firstName, lastName))
                    tvUserName.text = "${updated.firstName} ${updated.lastName}"
                    tvUserEmail.text = updated.email
                    etFirstName.setText(updated.firstName)
                    etLastName.setText(updated.lastName)
                    etEmail.setText(updated.email)
                    Toast.makeText(this@ProfileActivity, "Profile updated.", Toast.LENGTH_SHORT).show()
                } catch (e: Exception) {
                    Toast.makeText(this@ProfileActivity, "Update failed: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }

        btnChangePassword.setOnClickListener { showChangePasswordDialog() }
        btnCancel.setOnClickListener { finish() }
        btnLogout.setOnClickListener { performLogout() }
    }

    private fun showChangePasswordDialog() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_change_password, null)
        val etCurrentPassword = dialogView.findViewById<TextInputEditText>(R.id.etCurrentPassword)
        val etNewPassword = dialogView.findViewById<TextInputEditText>(R.id.etNewPassword)
        val etConfirmPassword = dialogView.findViewById<TextInputEditText>(R.id.etConfirmPassword)

        val dialog = MaterialAlertDialogBuilder(this)
            .setTitle("Change Password")
            .setView(dialogView)
            .setPositiveButton("Change", null)
            .setNegativeButton("Cancel", null)
            .create()

        dialog.setOnShowListener {
            val positiveButton = dialog.getButton(androidx.appcompat.app.AlertDialog.BUTTON_POSITIVE)
            positiveButton.setOnClickListener {
                val currentPassword = etCurrentPassword.text?.toString()?.trim() ?: ""
                val newPassword = etNewPassword.text?.toString()?.trim() ?: ""
                val confirmPassword = etConfirmPassword.text?.toString()?.trim() ?: ""

                when {
                    currentPassword.isBlank() || newPassword.isBlank() || confirmPassword.isBlank() -> {
                        Toast.makeText(this, "All password fields are required.", Toast.LENGTH_SHORT).show()
                    }
                    newPassword.length < 8 -> {
                        Toast.makeText(this, "New password must be at least 8 characters.", Toast.LENGTH_SHORT).show()
                    }
                    newPassword != confirmPassword -> {
                        Toast.makeText(this, "New passwords do not match.", Toast.LENGTH_SHORT).show()
                    }
                    else -> {
                        lifecycleScope.launch {
                            try {
                                val api = RetrofitClient.getApiService(this@ProfileActivity)
                                api.changePassword(ChangePasswordRequest(currentPassword, newPassword))
                                Toast.makeText(this@ProfileActivity, "Password changed successfully.", Toast.LENGTH_SHORT).show()
                                dialog.dismiss()
                            } catch (e: Exception) {
                                Toast.makeText(this@ProfileActivity, "Change password failed: ${e.message}", Toast.LENGTH_LONG).show()
                            }
                        }
                    }
                }
            }
        }

        dialog.show()
    }

    private fun performLogout() {
        lifecycleScope.launch {
            try {
                TokenManager.clearToken(this@ProfileActivity)
                RetrofitClient.resetClient()
                startActivity(Intent(this@ProfileActivity, LoginActivity::class.java))
                finishAffinity()
            } catch (e: Exception) {
                Toast.makeText(this@ProfileActivity, "Logout failed: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun loadProfile() {
        lifecycleScope.launch {
            try {
                val api = RetrofitClient.getApiService(this@ProfileActivity)
                val user = api.getCurrentUser()
                tvUserName.text = "${user.firstName} ${user.lastName}"
                tvUserEmail.text = user.email
                etFirstName.setText(user.firstName)
                etLastName.setText(user.lastName)
                etEmail.setText(user.email)

                val alerts = api.getAllAlerts()
                val userAlerts = alerts.filter { alert ->
                    alert.reporter?.id == user.id || alert.reporter?.email?.equals(user.email, ignoreCase = true) == true
                }
                updateStats(userAlerts)
            } catch (e: Exception) {
                Toast.makeText(this@ProfileActivity, "Load failed: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun updateStats(alerts: List<Alert>) {
        tvReportsCount.text = alerts.size.toString()
        tvActiveCount.text = alerts.count { it.status != "RESOLVED" }.toString()
        tvResolvedCount.text = alerts.count { it.status == "RESOLVED" }.toString()
    }
}
