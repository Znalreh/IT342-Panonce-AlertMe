package com.example.alertme.data.api

import android.content.Context
import com.example.alertme.data.models.Alert
import com.google.gson.Gson
import com.example.alertme.data.preferences.TokenManager
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.flow.first
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import okio.ByteString
import android.util.Log

/**
 * Simple WebSocket client to receive alert status updates from the server.
 * Listeners receive a parsed AlertStatusUpdate whenever a message arrives.
 */
class AlertWebSocketClient {
    data class AlertStatusUpdate(
        val alertId: String,
        val status: String,
        val alertTitle: String? = null,
        val updatedAt: String? = null,
        val eventType: String? = null
    )

    private var webSocket: WebSocket? = null
    private val gson = Gson()
    private val listeners = mutableListOf<(AlertStatusUpdate) -> Unit>()

    fun addListener(listener: (AlertStatusUpdate) -> Unit) {
        listeners.add(listener)
    }

    fun removeListener(listener: (AlertStatusUpdate) -> Unit) {
        listeners.remove(listener)
    }

    fun start(context: Context) {
        stop()

        val baseUrl = try {
            com.example.alertme.BuildConfig.API_BASE_URL
        } catch (e: Exception) {
            "http://10.0.2.2:8080/"
        }

        // Convert http(s) -> ws(s) and ensure no trailing slash
        val base = baseUrl.trim().removeSuffix("/")
        val wsUrl = when {
            base.startsWith("https://") -> base.replaceFirst("https://", "wss://")
            base.startsWith("http://") -> base.replaceFirst("http://", "ws://")
            base.startsWith("ws://") || base.startsWith("wss://") -> base
            else -> "ws://$base"
        } + "/ws/alerts"

        val client = OkHttpClient.Builder().build()

        // Try to attach Authorization header if token available
        val requestBuilder = Request.Builder().url(wsUrl)
        try {
            val token = runBlocking { TokenManager.getAccessToken(context).first() }
            if (!token.isNullOrBlank()) {
                requestBuilder.addHeader(com.example.alertme.config.AppConfig.HTTP.HEADER_AUTH, "Bearer $token")
            }
        } catch (_: Exception) {
        }

        val request = requestBuilder.build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: okhttp3.Response) {
                Log.d("AlertWebSocketClient", "WebSocket opened to $wsUrl")
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                try {
                    Log.d("AlertWebSocketClient", "Received WS message: $text")
                    val update = gson.fromJson(text, AlertStatusUpdate::class.java)
                    if (update?.alertId != null && (update.status != null || update.eventType != null)) {
                        listeners.forEach { it.invoke(update) }
                    }
                } catch (e: Exception) {
                    // ignore parse errors
                }
            }

            override fun onMessage(webSocket: WebSocket, bytes: ByteString) {
                onMessage(webSocket, bytes.utf8())
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: okhttp3.Response?) {
                // stop socket on failure; upper layers can restart if desired
                stop()
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                // cleaned up by stop()
            }
        })
    }

    fun stop() {
        try {
            webSocket?.close(1000, "Client closing")
        } catch (_: Exception) {
        }
        webSocket = null
    }
}
