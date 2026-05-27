package com.example.alertme.auth

import android.content.Context
import android.util.Log
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task
import kotlinx.coroutines.tasks.await

class GoogleSignInHelper(private val context: Context) {
    private val googleSignInClient: GoogleSignInClient by lazy {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(WEB_CLIENT_ID)
            .requestEmail()
            .build()
        GoogleSignIn.getClient(context, gso)
    }

    fun getSignInClient(): GoogleSignInClient = googleSignInClient

    suspend fun getIdToken(): String? {
        return try {
            val account = GoogleSignIn.getLastSignedInAccount(context)
            if (account != null) {
                account.idToken
            } else {
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get ID token", e)
            null
        }
    }

    fun signOut() {
        googleSignInClient.signOut()
    }

    companion object {
        private const val TAG = "GoogleSignInHelper"
        // This is the Web Client ID from Google Cloud Console.
        // For Android sign-in to work, the project must also have an Android OAuth client
        // registered with package name com.example.alertme and the app's SHA1 fingerprint.
        const val WEB_CLIENT_ID = "1052720413529-qrfujirid5sgd963umo6635q01bemini.apps.googleusercontent.com"
    }
}
