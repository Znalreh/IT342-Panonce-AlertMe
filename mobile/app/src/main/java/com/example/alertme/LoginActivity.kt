package com.example.alertme

import android.content.Intent
import android.os.Bundle
import android.util.Patterns
import android.widget.CheckBox
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText

class LoginActivity : AppCompatActivity() {

    private lateinit var emailInput: TextInputEditText
    private lateinit var passwordInput: TextInputEditText
    private lateinit var rememberMeCheckbox: CheckBox
    private lateinit var signInButton: MaterialButton
    private lateinit var googleSignInButton: MaterialButton
    private lateinit var forgotPasswordText: TextView
    private lateinit var registerLink: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        // Initialize views
        emailInput = findViewById(R.id.emailInput)
        passwordInput = findViewById(R.id.passwordInput)
        rememberMeCheckbox = findViewById(R.id.rememberMeCheckbox)
        signInButton = findViewById(R.id.signInButton)
        googleSignInButton = findViewById(R.id.googleSignInButton)
        forgotPasswordText = findViewById(R.id.forgotPasswordText)
        registerLink = findViewById(R.id.registerLink)

        setupListeners()
    }

    private fun setupListeners() {
        // Sign In Button
        signInButton.setOnClickListener {
            handleSignIn()
        }

        // Google Sign In Button
        googleSignInButton.setOnClickListener {
            handleGoogleSignIn()
        }

        // Forgot Password
        forgotPasswordText.setOnClickListener {
            Toast.makeText(this, "Forgot Password clicked", Toast.LENGTH_SHORT).show()
            // TODO: Navigate to Forgot Password screen
        }

        // Register Link
        registerLink.setOnClickListener {
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        }
    }

    private fun handleSignIn() {
        val email = emailInput.text.toString().trim()
        val password = passwordInput.text.toString().trim()

        // Validation
        if (email.isEmpty()) {
            emailInput.error = "Email is required"
            emailInput.requestFocus()
            return
        }

        if (!isValidEmail(email)) {
            emailInput.error = "Please enter a valid email"
            emailInput.requestFocus()
            return
        }

        if (password.isEmpty()) {
            passwordInput.error = "Password is required"
            passwordInput.requestFocus()
            return
        }

        if (password.length < 6) {
            passwordInput.error = "Password must be at least 6 characters"
            passwordInput.requestFocus()
            return
        }

        // TODO: Implement actual authentication with Spring Boot backend
        Toast.makeText(this, "Signing in...", Toast.LENGTH_SHORT).show()

        // Simulate successful login - navigate to main dashboard
        val intent = Intent(this, DashboardActivity::class.java)
        startActivity(intent)
        finish()
    }

    private fun handleGoogleSignIn() {
        // TODO: Implement Google OAuth 2.0 authentication
        Toast.makeText(this, "Google Sign In clicked", Toast.LENGTH_SHORT).show()
    }

    private fun isValidEmail(email: String): Boolean {
        return Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
}
