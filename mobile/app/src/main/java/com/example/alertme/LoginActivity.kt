package com.example.alertme

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.alertme.auth.GoogleSignInHelper
import com.example.alertme.data.api.RetrofitClient
import com.example.alertme.data.dto.LoginRequest
import com.example.alertme.data.dto.GoogleAuthRequest
import com.example.alertme.data.preferences.TokenManager
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.common.api.ApiException
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException

class LoginActivity : AppCompatActivity() {
    
    private lateinit var googleSignInHelper: GoogleSignInHelper
    private lateinit var googleSignInClient: GoogleSignInClient
    private val RC_SIGN_IN = 9001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        googleSignInHelper = GoogleSignInHelper(this)
        googleSignInClient = googleSignInHelper.getSignInClient()

        val emailEditText = findViewById<EditText>(R.id.emailInput)
        val passwordEditText = findViewById<EditText>(R.id.passwordInput)
        val loginButton = findViewById<Button>(R.id.signInButton)
        val googleSignInButton = findViewById<Button>(R.id.googleSignInButton)
        val registerTextView = findViewById<TextView>(R.id.registerLink)

        loginButton.setOnClickListener {
            val email = emailEditText.text.toString().trim()
            val password = passwordEditText.text.toString().trim()

            if (email.isNotEmpty() && password.isNotEmpty()) {
                performLogin(email, password)
            } else {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
            }
        }

        googleSignInButton.setOnClickListener {
            performGoogleSignIn()
        }

        registerTextView.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }

    private fun performLogin(email: String, password: String) {
        lifecycleScope.launch {
            try {
                val loginRequest = LoginRequest(email = email, password = password)
                val apiService = RetrofitClient.getApiService(this@LoginActivity)
                val authResponse = apiService.login(loginRequest)
                
                // Save token and user info
                TokenManager.saveToken(
                    context = this@LoginActivity,
                    accessToken = authResponse.accessToken,
                    tokenType = authResponse.tokenType,
                    expiresAt = authResponse.expiresAt,
                    userId = authResponse.id,
                    userEmail = authResponse.email,
                    userRole = authResponse.role
                )
                
                Toast.makeText(this@LoginActivity, "Login successful", Toast.LENGTH_SHORT).show()
                startActivity(Intent(this@LoginActivity, DashboardActivity::class.java))
                finish()
            } catch (e: IOException) {
                Toast.makeText(
                    this@LoginActivity,
                    "Network error: Check your internet or server connection",
                    Toast.LENGTH_SHORT
                ).show()
            } catch (e: HttpException) {
                val errorMsg = when (e.code()) {
                    401 -> "Invalid email or password"
                    403 -> "Access forbidden"
                    404 -> "Login endpoint not found"
                    else -> "Server error: ${e.code()}"
                }
                Toast.makeText(this@LoginActivity, errorMsg, Toast.LENGTH_SHORT).show()
            } catch (e: Exception) {
                Toast.makeText(
                    this@LoginActivity,
                    "An unexpected error occurred: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun performGoogleSignIn() {
        val signInIntent = googleSignInClient.signInIntent
        startActivityForResult(signInIntent, RC_SIGN_IN)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == RC_SIGN_IN) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(data)
            try {
                val account = task.getResult(ApiException::class.java)
                if (account != null) {
                    handleGoogleSignInSuccess(account)
                }
            } catch (e: ApiException) {
                Toast.makeText(
                    this,
                    "Google Sign-In failed: ${e.statusCode}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun handleGoogleSignInSuccess(account: com.google.android.gms.auth.api.signin.GoogleSignInAccount) {
        lifecycleScope.launch {
            try {
                val idToken = account.idToken ?: return@launch
                val email = account.email ?: return@launch
                val firstName = account.givenName ?: "Google"
                val lastName = account.familyName ?: "User"
                val googleSubject = account.id ?: ""

                // Create Google auth request
                val googleAuthRequest = GoogleAuthRequest(
                    idToken = idToken,
                    email = email,
                    firstName = firstName,
                    lastName = lastName,
                    googleSubject = googleSubject
                )

                // Send to backend
                val apiService = RetrofitClient.getApiService(this@LoginActivity)
                val authResponse = apiService.googleAuth(googleAuthRequest)

                // Save token and user info
                TokenManager.saveToken(
                    context = this@LoginActivity,
                    accessToken = authResponse.accessToken,
                    tokenType = authResponse.tokenType,
                    expiresAt = authResponse.expiresAt,
                    userId = authResponse.id,
                    userEmail = authResponse.email,
                    userRole = authResponse.role
                )

                Toast.makeText(this@LoginActivity, "Google Sign-In successful", Toast.LENGTH_SHORT).show()
                startActivity(Intent(this@LoginActivity, DashboardActivity::class.java))
                finish()
            } catch (e: HttpException) {
                val errorMsg = when (e.code()) {
                    401 -> "Google authentication failed"
                    403 -> "Access forbidden"
                    404 -> "Google auth endpoint not found"
                    else -> "Server error: ${e.code()}"
                }
                Toast.makeText(this@LoginActivity, errorMsg, Toast.LENGTH_SHORT).show()
            } catch (e: IOException) {
                Toast.makeText(
                    this@LoginActivity,
                    "Network error: Check your internet or server connection",
                    Toast.LENGTH_SHORT
                ).show()
            } catch (e: Exception) {
                Toast.makeText(
                    this@LoginActivity,
                    "An unexpected error occurred: ${e.message}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }
}
