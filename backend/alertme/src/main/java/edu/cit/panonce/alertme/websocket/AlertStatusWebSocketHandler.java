package edu.cit.panonce.alertme.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.cit.panonce.alertme.alert.dto.AlertStatusUpdateMessage;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AlertStatusWebSocketHandler extends TextWebSocketHandler {

    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
    }

    public void broadcastStatusUpdate(AlertStatusUpdateMessage updateMessage) {
        String payload;
        try {
            payload = objectMapper.writeValueAsString(updateMessage);
        } catch (IOException e) {
            return;
        }

        TextMessage message = new TextMessage(payload);
        sessions.removeIf(session -> {
            if (!session.isOpen()) {
                return true;
            }
            try {
                session.sendMessage(message);
            } catch (IOException e) {
                return true;
            }
            return false;
        });
    }
}
