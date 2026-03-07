package edu.cit.panonce.alertme.config;

import edu.cit.panonce.alertme.entity.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private final ObjectMapper objectMapper;
    private final byte[] secretBytes;
    private final long expirationMs;

    public JwtService(
        @Value("${app.jwt.secret}") String secret,
        @Value("${app.jwt.expiration-ms:86400000}") long expirationMs
    ) {
        this.objectMapper = new ObjectMapper();
        this.secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationMs = expirationMs;
    }

    public String generateToken(User user) {
        long issuedAtSeconds = Instant.now().getEpochSecond();
        long expSeconds = Instant.now().plusMillis(expirationMs).getEpochSecond();

        Map<String, Object> header = Map.of(
            "alg", "HS256",
            "typ", "JWT"
        );

        Map<String, Object> payload = new HashMap<>();
        payload.put("sub", user.getEmail());
        payload.put("role", user.getRole().name());
        payload.put("iat", issuedAtSeconds);
        payload.put("exp", expSeconds);

        try {
            String encodedHeader = base64UrlEncode(objectMapper.writeValueAsBytes(header));
            String encodedPayload = base64UrlEncode(objectMapper.writeValueAsBytes(payload));
            String signingInput = encodedHeader + "." + encodedPayload;
            String signature = base64UrlEncode(sign(signingInput));
            return signingInput + "." + signature;
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to generate JWT token.", ex);
        }
    }

    public String extractUsername(String token) {
        return (String) parseAndValidate(token).get("sub");
    }

    public Instant extractExpiration(String token) {
        long exp = getLongClaim(parseAndValidate(token), "exp");
        return Instant.ofEpochSecond(exp);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        Map<String, Object> claims = parseAndValidate(token);
        String username = (String) claims.get("sub");
        long exp = getLongClaim(claims, "exp");
        return username != null
            && username.equalsIgnoreCase(userDetails.getUsername())
            && Instant.now().isBefore(Instant.ofEpochSecond(exp));
    }

    private Map<String, Object> parseAndValidate(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Malformed JWT.");
            }

            String signingInput = parts[0] + "." + parts[1];
            byte[] expected = sign(signingInput);
            byte[] actual = base64UrlDecode(parts[2]);
            if (!MessageDigest.isEqual(expected, actual)) {
                throw new IllegalArgumentException("Invalid JWT signature.");
            }

            byte[] payloadBytes = base64UrlDecode(parts[1]);
            return objectMapper.readValue(payloadBytes, new TypeReference<>() { });
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid JWT token.", ex);
        }
    }

    private long getLongClaim(Map<String, Object> claims, String key) {
        Object value = claims.get(key);
        if (value instanceof Number number) {
            return number.longValue();
        }
        throw new IllegalArgumentException("Invalid JWT claim: " + key);
    }

    private byte[] sign(String payload) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secretBytes, "HmacSHA256"));
        return mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
    }

    private String base64UrlEncode(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }

    private byte[] base64UrlDecode(String value) {
        return Base64.getUrlDecoder().decode(value);
    }
}
