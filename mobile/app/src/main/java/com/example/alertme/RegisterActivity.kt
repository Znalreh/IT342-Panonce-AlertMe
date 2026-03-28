package com.example.alertme

import android.os.Bundle
import android.util.Patterns
import android.widget.ArrayAdapter
import android.widget.AutoCompleteTextView
import android.widget.CheckBox
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText

class RegisterActivity : AppCompatActivity() {

    private lateinit var firstNameInput: TextInputEditText
    private lateinit var lastNameInput: TextInputEditText
    private lateinit var emailInput: TextInputEditText
    private lateinit var departmentInput: TextInputEditText
    private lateinit var passwordInput: TextInputEditText
    private lateinit var confirmPasswordInput: TextInputEditText
    private lateinit var roleSpinner: AutoCompleteTextView
    private lateinit var termsCheckbox: CheckBox
    private lateinit var createAccountButton: MaterialButton
    private lateinit var googleSignUpButton: MaterialButton
    private lateinit var signInLink: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        // Initialize views
        firstNameInput = findViewById(R.id.firstNameInput)
        lastNameInput = findViewById(R.id.lastNameInput)
        emailInput = findViewById(R.id.emailInput)
        roleSpinner = findViewById(R.id.roleSpinner)
        departmentInput = findViewById(R.id.departmentInput)
        passwordInput = findViewById(R.id.passwordInput)
        confirmPasswordInput = findViewById(R.id.confirmPasswordInput)
        termsCheckbox = findViewById(R.id.termsCheckbox)
        createAccountButton = findViewById(R.id.createAccountButton)
        googleSignUpButton = findViewById(R.id.googleSignUpButton)
        signInLink = findViewById(R.id.signInLink)

        setupRoleSpinner()
        setupListeners()
    }

    private fun setupRoleSpinner() {
        val roles = resources.getStringArray(R.array.role_options)
        val adapter = ArrayAdapter(
            this,
            android.R.layout.simple_dropdown_item_1line,
            roles
        )
        roleSpinner.setAdapter(adapter)
    }

    private fun setupListeners() {
        // Create Account Button
        createAccountButton.setOnClickListener {
            handleRegistration()
        }

        // Google Sign Up Button
        googleSignUpButton.setOnClickListener {
            handleGoogleSignUp()
        }

        // Sign In Link
        signInLink.setOnClickListener {
            finish() // Go back to Login screen
        }
    }

    private fun handleRegistration() {
        val firstName = firstNameInput.text.toString().trim()
        val lastName = lastNameInput.text.toString().trim()
        val email = emailInput.text.toString().trim()
        val role = roleSpinner.text.toString().trim()
        val department = departmentInput.text.toString().trim()
        val password = passwordInput.text.toString().trim()
        val confirmPassword = confirmPasswordInput.text.toString().trim()

        // Validation
        if (firstName.isEmpty()) {
            firstNameInput.error = "First name is required"
            firstNameInput.requestFocus()
            return
        }

        if (lastName.isEmpty()) {
            lastNameInput.error = "Last name is required"
            lastNameInput.requestFocus()
            return
        }

        if (email.isEmpty()) {
            emailInput.error = "Email is required"
            emailInput.requestFocus()
            return
        }

        if (!isValidEmail(email)) {
            emailInput.error = "Please enter a valid university email"
            emailInput.requestFocus()
            return
        }

        if (role.isEmpty()) {
            roleSpinner.error = "Please select a role"
            roleSpinner.requestFocus()
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

        if (!isPasswordStrong(password)) {
            passwordInput.error = "Password must contain letters and numbers"
            passwordInput.requestFocus()
            return
        }

        if (confirmPassword.isEmpty()) {
            confirmPasswordInput.error = "Please confirm your password"
            confirmPasswordInput.requestFocus()
            return
        }

        if (password != confirmPassword) {
            confirmPasswordInput.error = "Passwords do not match"
            confirmPasswordInput.requestFocus()
            return
        }

        if (!termsCheckbox.isChecked) {
            Toast.makeText(
                this,
                "Please agree to Terms & Conditions",
                Toast.LENGTH_SHORT
            ).show()
            return
        }

        // TODO: Implement actual registration with Spring Boot backend
        registerUser(firstName, lastName, email, role, department, password)
    }

    private fun registerUser(
        firstName: String,
        lastName: String,
        email: String,
        role: String,
        department: String,
        password: String
    ) {
        // TODO: Call your Spring Boot API here
        Toast.makeText(this, "Creating account...", Toast.LENGTH_SHORT).show()

        // Simulate successful registration
        Toast.makeText(
            this,
            "Account created successfully! Please sign in.",
            Toast.LENGTH_LONG
        ).show()

        // Go back to login screen
        finish()
    }

    private fun handleGoogleSignUp() {
        // TODO: Implement Google OAuth 2.0 registration
        Toast.makeText(this, "Google Sign Up clicked", Toast.LENGTH_SHORT).show()
    }

    private fun isValidEmail(email: String): Boolean {
        return Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }

    private fun isPasswordStrong(password: String): Boolean {
        // Check if password contains at least one letter and one number
        val hasLetter = password.any { it.isLetter() }
        val hasDigit = password.any { it.isDigit() }
        return hasLetter && hasDigit
    }
}