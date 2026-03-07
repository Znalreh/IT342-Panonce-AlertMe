package edu.cit.panonce.alertme.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class OAuth2ConfigValidator {

    @Value("${app.oauth2.google.enabled:false}")
    private boolean googleEnabled;

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:}")
    private String googleClientSecret;

    @PostConstruct
    public void validateGoogleOAuthConfiguration() {
        if (!googleEnabled) {
            return;
        }

        if (isMissing(googleClientId) || isMissing(googleClientSecret)) {
            throw new IllegalStateException(
                "Google OAuth configuration is missing. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET " +
                "(or backend/alertme/.env.properties), then restart the backend."
            );
        }
    }

    private boolean isMissing(String value) {
        if (value == null || value.isBlank()) {
            return true;
        }

        String trimmed = value.trim();
        return trimmed.startsWith("${") || trimmed.contains("placeholder");
    }
}
