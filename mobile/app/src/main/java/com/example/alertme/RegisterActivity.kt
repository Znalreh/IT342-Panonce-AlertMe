package com.example.alertme

import android.content.Intent
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.AutoCompleteTextView
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.alertme.data.api.RetrofitClient
import com.example.alertme.data.dto.RegisterRequest
import com.example.alertme.data.preferences.TokenManager
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException

class RegisterActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val firstNameEditText = findViewById<EditText>(R.id.firstNameInput)
        val lastNameEditText = findViewById<EditText>(R.id.lastNameInput)
        val emailEditText = findViewById<EditText>(R.id.emailInput)
        val passwordEditText = findViewById<EditText>(R.id.passwordInput)
        val confirmPasswordEditText = findViewById<EditText>(R.id.confirmPasswordInput)
        val roleAutoComplete = findViewById<AutoCompleteTextView>(R.id.roleAutoComplete)
        val registerButton = findViewById<Button>(R.id.createAccountButton)
        val loginTextView = findViewById<TextView>(R.id.signInLink)
        val termsCheckbox = findViewById<android.widget.CheckBox>(R.id.termsCheckbox)

        // Populate role options from resources
        val roles = resources.getStringArray(R.array.role_options)
        val roleAdapter = ArrayAdapter(this, android.R.layout.simple_dropdown_item_1line, roles)
        roleAutoComplete.setAdapter(roleAdapter)
        // Default to first option if user doesn't choose
        roleAutoComplete.setText(roles.first(), false)

        registerButton.setOnClickListener {
            val firstName = firstNameEditText.text.toString().trim()
            val lastName = lastNameEditText.text.toString().trim()
            val email = emailEditText.text.toString().trim()
            val password = passwordEditText.text.toString().trim()
            val confirmPassword = confirmPasswordEditText.text.toString().trim()
            val roleSelected = roleAutoComplete.text.toString().trim()

            if (!termsCheckbox.isChecked) {
                Toast.makeText(this, "You must accept the Terms of Service", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (firstName.isEmpty() || lastName.isEmpty() || email.isEmpty() || password.isEmpty() || confirmPassword.isEmpty()) {
                Toast.makeText(this, "Please fill all required fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (password != confirmPassword) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            performRegistration(
                firstName = firstName,
                lastName = lastName,
                email = email,
                password = password,
                roleText = roleSelected
            )
        }

        loginTextView.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }

    private fun performRegistration(
        firstName: String,
        lastName: String,
        email: String,
        password: String,
        roleText: String
    ) {
        lifecycleScope.launch {
            try {
                // Map UI role text to backend role value (e.g., "Student" -> "STUDENT")
                val roleValue = roleText.uppercase().replace(' ', '_')

                val registerRequest = RegisterRequest(
                    firstName = firstName,
                    lastName = lastName,
                    email = email,
                    password = password,
                    role = roleValue
                )
                val apiService = RetrofitClient.getApiService(this@RegisterActivity)
                val authResponse = apiService.register(registerRequest)
                
                TokenManager.saveToken(
                    context = this@RegisterActivity,
                    accessToken = authResponse.accessToken,
                    tokenType = authResponse.tokenType,
                    expiresAt = authResponse.expiresAt,
                    userId = authResponse.id,
                    userEmail = authResponse.email,
                    userRole = authResponse.role
                )
                
                Toast.makeText(this@RegisterActivity, "Registration successful", Toast.LENGTH_SHORT).show()
                startActivity(Intent(this@RegisterActivity, DashboardActivity::class.java))
                finish()
            } catch (e: IOException) {
                Toast.makeText(this@RegisterActivity, "Network error: ${e.message}", Toast.LENGTH_SHORT).show()
            } catch (e: HttpException) {
                val errorMsg = when (e.code()) {
                    400 -> "Invalid registration details or user already exists"
                    else -> "Registration failed: ${e.code()}"
                }
                Toast.makeText(this@RegisterActivity, errorMsg, Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Toast.makeText(this@RegisterActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
