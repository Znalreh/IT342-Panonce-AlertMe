package com.example.alertme.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth_tokens")

object TokenManager {
    private val ACCESS_TOKEN_KEY = stringPreferencesKey("access_token")
    private val TOKEN_TYPE_KEY = stringPreferencesKey("token_type")
    private val EXPIRES_AT_KEY = stringPreferencesKey("expires_at")
    private val USER_ID_KEY = stringPreferencesKey("user_id")
    private val USER_EMAIL_KEY = stringPreferencesKey("user_email")
    private val USER_ROLE_KEY = stringPreferencesKey("user_role")
    
    fun getAccessToken(context: Context): Flow<String?> {
        return context.dataStore.data.map { preferences ->
            preferences[ACCESS_TOKEN_KEY]
        }
    }
    
    fun getTokenType(context: Context): Flow<String?> {
        return context.dataStore.data.map { preferences ->
            preferences[TOKEN_TYPE_KEY]
        }
    }
    
    fun getUserId(context: Context): Flow<String?> {
        return context.dataStore.data.map { preferences ->
            preferences[USER_ID_KEY]
        }
    }
    
    suspend fun saveToken(context: Context, accessToken: String, tokenType: String = "Bearer", expiresAt: Long = 0, userId: String = "", userEmail: String = "", userRole: String = "") {
        context.dataStore.edit { preferences ->
            preferences[ACCESS_TOKEN_KEY] = accessToken
            preferences[TOKEN_TYPE_KEY] = tokenType
            preferences[EXPIRES_AT_KEY] = expiresAt.toString()
            preferences[USER_ID_KEY] = userId
            preferences[USER_EMAIL_KEY] = userEmail
            preferences[USER_ROLE_KEY] = userRole
        }
    }
    
    suspend fun clearToken(context: Context) {
        context.dataStore.edit { preferences ->
            preferences.remove(ACCESS_TOKEN_KEY)
            preferences.remove(TOKEN_TYPE_KEY)
            preferences.remove(EXPIRES_AT_KEY)
            preferences.remove(USER_ID_KEY)
            preferences.remove(USER_EMAIL_KEY)
            preferences.remove(USER_ROLE_KEY)
        }
    }
    
    fun isTokenExpired(context: Context): Flow<Boolean> {
        return context.dataStore.data.map { preferences ->
            val expiresAt = preferences[EXPIRES_AT_KEY]?.toLongOrNull() ?: 0
            expiresAt <= System.currentTimeMillis()
        }
    }
}
