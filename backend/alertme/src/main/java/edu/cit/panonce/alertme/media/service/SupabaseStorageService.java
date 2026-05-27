package edu.cit.panonce.alertme.media.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    private final String supabaseUrl;
    private final String supabaseApiKey;
    private final String supabaseServiceRoleKey;
    private final String bucketName = "alerts";
    private final RestTemplate restTemplate;

    public SupabaseStorageService(
            RestTemplate restTemplate,
            @Value("${supabase.url:}") String supabaseUrl,
            @Value("${supabase.api-key:}") String supabaseApiKey,
            @Value("${supabase.service-role-key:}") String supabaseServiceRoleKey) {
        this.restTemplate = restTemplate;
        String normalizedUrl = normalizeString(supabaseUrl);
        if (normalizedUrl.endsWith("/")) {
            normalizedUrl = normalizedUrl.substring(0, normalizedUrl.length() - 1);
        }
        this.supabaseUrl = normalizedUrl;
        this.supabaseApiKey = normalizeString(supabaseApiKey);
        this.supabaseServiceRoleKey = normalizeString(supabaseServiceRoleKey);
    }

    private String normalizeString(String value) {
        if (value == null) {
            return "";
        }
        value = value.trim();
        if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("\'") && value.endsWith("\'"))) {
            value = value.substring(1, value.length() - 1).trim();
        }
        if (value.toLowerCase().startsWith("bearer ")) {
            value = value.substring(7).trim();
        }
        value = value.replaceAll("[\r\n\t ]+", "");
        return value;
    }

    /**
     * Upload a file to Supabase storage and return the storage key (filename)
     * @param file The file to upload
     * @param originalFilename The original filename
     * @return The storage key (filename) used in Supabase
     * @throws Exception if upload fails
     */
    public String uploadFile(MultipartFile file, String originalFilename) throws Exception {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Generate storage key with UUID prefix to ensure uniqueness
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex);
        }
        
        String storageKey = UUID.randomUUID().toString() + extension;
        String localStorageKey = "local/" + storageKey;

        // Build upload URL for Supabase Storage API
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + storageKey;

        String bearerToken = !supabaseServiceRoleKey.isBlank() ? supabaseServiceRoleKey : supabaseApiKey;
        String apiKeyHeader = !supabaseServiceRoleKey.isBlank() ? supabaseServiceRoleKey : supabaseApiKey;
        if (bearerToken.isBlank()) {
            throw new IllegalStateException("Supabase authentication key is not configured. Set supabase.api-key or supabase.service-role-key.");
        }

        MediaType contentType = MediaType.APPLICATION_OCTET_STREAM;
        if (file.getContentType() != null) {
            try {
                contentType = MediaType.parseMediaType(file.getContentType());
            } catch (Exception ignored) {
                contentType = MediaType.APPLICATION_OCTET_STREAM;
            }
        }

        // Prepare headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(contentType);
        headers.set("Authorization", "Bearer " + bearerToken);
        headers.set("apikey", apiKeyHeader);
        headers.set("x-upsert", "true");

        try {
            System.out.println("Uploading file to Supabase: " + uploadUrl);
            System.out.println("File size: " + file.getSize() + " bytes");
            System.out.println("Using bearer token type: " + (supabaseServiceRoleKey != null && !supabaseServiceRoleKey.isBlank() ? "service-role" : "anon"));

            // Create request with file bytes
            HttpEntity<byte[]> request = new HttpEntity<>(file.getBytes(), headers);

            // Upload to Supabase
            ResponseEntity<String> response = restTemplate.exchange(
                uploadUrl,
                HttpMethod.PUT,
                request,
                String.class
            );

            System.out.println("Supabase response status: " + response.getStatusCode());
            System.out.println("Supabase response body: " + response.getBody());

            if (!response.getStatusCode().is2xxSuccessful()) {
                String errorMsg = "Failed to upload file to Supabase: HTTP " + response.getStatusCode() + " - " + response.getBody();
                System.err.println("ERROR: " + errorMsg);
                System.err.println("Upload URL: " + uploadUrl);
                System.err.println("Bucket: " + bucketName);
                System.err.println("Storage Key: " + storageKey);
                System.err.println("Content-Type: " + contentType);
                throw new RuntimeException(errorMsg);
            }

            System.out.println("File uploaded successfully to Supabase: " + storageKey);
            // Return the storage key (what we'll store in the database)
            return storageKey;
        } catch (Exception e) {
            String errorMessage = "Supabase upload failed for " + originalFilename + ": " + e.getMessage();
            System.err.println(errorMessage);
            e.printStackTrace();
            throw new RuntimeException(errorMessage, e);
        }
    }

}
