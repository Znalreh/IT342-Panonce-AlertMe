package edu.cit.panonce.alertme.config;

import edu.cit.panonce.alertme.auth.AuthService;
import edu.cit.panonce.alertme.auth.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private static final Logger log = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

    private final AuthService authService;
    private final String successRedirectUrl;

    public OAuth2AuthenticationSuccessHandler(
        AuthService authService,
        @Value("${app.oauth2.success-redirect-url:http://localhost:5173/login}") String successRedirectUrl
    ) {
        this.authService = authService;
        this.successRedirectUrl = successRedirectUrl;
        log.info("Configured OAuth successRedirectUrl={}", successRedirectUrl);
    }

    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = stringValue(oAuth2User.getAttribute("email"));
        String firstName = stringValue(oAuth2User.getAttribute("given_name"));
        String lastName = stringValue(oAuth2User.getAttribute("family_name"));
        String googleSubject = stringValue(oAuth2User.getAttribute("sub"));

        if (firstName.isBlank()) {
            firstName = stringValue(oAuth2User.getAttribute("name"));
        }

        AuthResponse authResponse = authService.authenticateWithGoogle(email, firstName, lastName, googleSubject);

        // Set HTTP-only cookie with the access token (best-effort, still include token in redirect for compatibility)
        try {
            long maxAgeSeconds = Math.max(0L, (authResponse.expiresAt() - System.currentTimeMillis()) / 1000);
            ResponseCookie cookie = ResponseCookie.from("alertme_jwt", authResponse.accessToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("None")
                .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        } catch (Exception e) {
            // Don't fail the flow if cookie creation isn't allowed; continue with redirect
            // Log via System.err as logger may not be initialized here
            System.err.println("Failed to set JWT cookie: " + e.getMessage());
        }

        String redirectTarget = UriComponentsBuilder.fromUriString(successRedirectUrl)
            .queryParam("accessToken", authResponse.accessToken())
            .queryParam("tokenType", authResponse.tokenType())
            .queryParam("expiresAt", authResponse.expiresAt())
            .build()
            .toUriString();
        log.info("OAuth success redirect target={}", redirectTarget);
        response.sendRedirect(redirectTarget);
    }

    private String stringValue(Object value) {
        return value == null ? "" : value.toString().trim();
    }
}
