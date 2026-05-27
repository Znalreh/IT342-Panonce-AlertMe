package com.example.alertme.data.api

import com.example.alertme.data.dto.AddCommentRequest
import com.example.alertme.data.dto.AlertCommentResponse
import com.example.alertme.data.dto.AdminStatsResponse
import com.example.alertme.data.dto.AssignAlertRequest
import com.example.alertme.data.dto.AuthResponse
import com.example.alertme.data.dto.LoginRequest
import com.example.alertme.data.dto.GoogleAuthRequest
import com.example.alertme.data.dto.RegisterRequest
import com.example.alertme.data.dto.UpdateAlertStatusRequest
import com.example.alertme.data.dto.ChangePasswordRequest
import com.example.alertme.data.dto.UpdateProfileRequest
import com.example.alertme.data.models.Alert
import com.example.alertme.data.models.User
import okhttp3.MultipartBody
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Part
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {
    
    // Authentication endpoints
    @POST("api/v1/auth/register")
    suspend fun register(@Body request: RegisterRequest): AuthResponse
    
    @POST("api/v1/auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse
    
    @POST("api/v1/auth/google")
    suspend fun googleAuth(@Body request: GoogleAuthRequest): AuthResponse
    
    @GET("api/v1/auth/me")
    suspend fun getCurrentUser(): User

    @PUT("api/v1/auth/me")
    suspend fun updateProfile(@Body request: UpdateProfileRequest): User

    @POST("api/v1/auth/me/change-password")
    suspend fun changePassword(@Body request: ChangePasswordRequest): Map<String, String>
    
    // Alert endpoints
    @POST("/api/v1/alerts")
    @Multipart
    suspend fun createAlert(
        @Part("category") category: okhttp3.RequestBody,
        @Part("priority") priority: okhttp3.RequestBody,
        @Part("title") title: okhttp3.RequestBody?,
        @Part("description") description: okhttp3.RequestBody?,
        @Part("locationText") locationText: okhttp3.RequestBody,
        @Part("latitude") latitude: okhttp3.RequestBody?,
        @Part("longitude") longitude: okhttp3.RequestBody?,
        @Part("geocodedAddress") geocodedAddress: okhttp3.RequestBody?,
        @Part files: List<MultipartBody.Part>?
    ): Alert
    
    @GET("api/v1/alerts")
    suspend fun getAllAlerts(): List<Alert>
    
    @GET("api/v1/alerts/{alertId}")
    suspend fun getAlert(@Path("alertId") alertId: String): Alert
    
    @POST("api/v1/alerts/{alertId}/comment")
    suspend fun addComment(
        @Path("alertId") alertId: String,
        @Body request: AddCommentRequest
    ): AlertCommentResponse
    
    @PUT("api/v1/alerts/{alertId}/status")
    suspend fun updateAlertStatus(
        @Path("alertId") alertId: String,
        @Body request: UpdateAlertStatusRequest
    ): Alert
    
    @PUT("api/v1/alerts/{alertId}/assign")
    suspend fun assignAlert(
        @Path("alertId") alertId: String,
        @Body request: AssignAlertRequest
    ): Alert
    
    @GET("api/v1/alerts/admin/stats")
    suspend fun getAdminStats(): AdminStatsResponse
    
    @GET("api/v1/alerts/admin")
    suspend fun getAdminAlerts(
        @Query("status") status: String?,
        @Query("category") category: String?,
        @Query("priority") priority: String?,
        @Query("search") search: String?
    ): List<Alert>
}
