package com.example.alertme.data.api

import android.content.Context
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    private var retrofit: Retrofit? = null
    private var apiService: ApiService? = null

    fun getApiService(context: Context): ApiService {
        if (apiService == null) {
            retrofit = createRetrofit(context)
            apiService = retrofit!!.create(ApiService::class.java)
        }
        return apiService!!
    }

    private fun createRetrofit(context: Context): Retrofit {
        val httpClientBuilder = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .addInterceptor { chain ->
                val request = chain.request().newBuilder()
                    .addHeader("Accept", "application/json")
                    .build()
                chain.proceed(request)
            }
            .addInterceptor(AuthInterceptor(context))

        // Only add logging in debug builds
        try {
            if (com.example.alertme.BuildConfig.DEBUG) {
                httpClientBuilder.addInterceptor(HttpLoggingInterceptor().apply {
                    level = HttpLoggingInterceptor.Level.BODY
                })
            }
        } catch (e: Exception) {
            // ignore if BuildConfig not available at compile-time in some tooling
        }

        val httpClient = httpClientBuilder.build()

        val baseUrl = try {
            com.example.alertme.BuildConfig.API_BASE_URL
        } catch (e: Exception) {
            // Fallback to local emulator URL
            "http://10.0.2.2:8080/"
        }

        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(httpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    fun resetClient() {
        retrofit = null
        apiService = null
    }
}
