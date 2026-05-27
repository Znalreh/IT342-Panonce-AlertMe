package com.example.alertme.data.api

import android.content.Context
import com.example.alertme.config.AppConfig
import com.example.alertme.data.preferences.TokenManager
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val context: Context) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val path = originalRequest.url.encodedPath

        // Skip adding the Authorization header for login and register endpoints
        if (path.contains(AppConfig.API.AUTH_LOGIN) || path.contains(AppConfig.API.AUTH_REGISTER)) {
            return chain.proceed(originalRequest)
        }

        // Get the access token from DataStore
        val accessToken = runBlocking {
            TokenManager.getAccessToken(context).first()
        }

        return if (accessToken != null) {
            val authorizedRequest = originalRequest.newBuilder()
                .header(AppConfig.HTTP.HEADER_AUTH, "Bearer $accessToken")
                .build()
            chain.proceed(authorizedRequest)
        } else {
            chain.proceed(originalRequest)
        }
    }
}
