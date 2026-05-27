package com.example.alertme

import android.os.Bundle
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.alertme.data.api.RetrofitClient
import com.example.alertme.data.dto.UpdateProfileRequest
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.launch

class ProfileActivity : AppCompatActivity() {

    private lateinit var tvUserName: android.widget.TextView
    private lateinit var tvUserEmail: android.widget.TextView
    private lateinit var etFirstName: TextInputEditText
    private lateinit var etLastName: TextInputEditText
    private lateinit var etEmail: TextInputEditText
    private lateinit var btnSave: MaterialButton
    private lateinit var btnCancel: MaterialButton
    private lateinit var btnBack: ImageView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        try {
            setContentView(R.layout.activity_profile)
            Toast.makeText(this, "Profile opened", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(this, "Layout error: ${e.message}", Toast.LENGTH_LONG).show()
            finish()
            return
        }

        try {
            initializeViews()
            setupListeners()
            loadProfile()
        } catch (e: Exception) {
            Toast.makeText(this, "Init error: ${e.message}", Toast.LENGTH_LONG).show()
            finish()
        }
    }

    private fun initializeViews() {
        btnBack = findViewById(R.id.btnBack)
        tvUserName = findViewById(R.id.tvUserName)
        tvUserEmail = findViewById(R.id.tvUserEmail)
        etFirstName = findViewById(R.id.etFirstName)
        etLastName = findViewById(R.id.etLastName)
        etEmail = findViewById(R.id.etEmail)
        btnSave = findViewById(R.id.btnSaveChanges)
        btnCancel = findViewById(R.id.btnCancel)
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

        btnCancel.setOnClickListener { finish() }
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
            } catch (e: Exception) {
                Toast.makeText(this@ProfileActivity, "Load failed: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }
}
