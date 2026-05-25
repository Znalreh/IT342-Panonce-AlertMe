package edu.cit.panonce.alertme.config;

import edu.cit.panonce.alertme.websocket.AlertStatusWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final AlertStatusWebSocketHandler alertStatusWebSocketHandler;

    public WebSocketConfig(AlertStatusWebSocketHandler alertStatusWebSocketHandler) {
        this.alertStatusWebSocketHandler = alertStatusWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(alertStatusWebSocketHandler, "/ws/alerts")
                .setAllowedOriginPatterns("*");
    }
}
