package edu.cit.panonce.alertme.media.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class SupabaseStorageService {

    private static final String SUPABASE_URL = "https://rjnshudkyinfhwyrxbmh.supabase.co";
    private static final String BUCKET_NAME = "alerts";
    
    private final RestTemplate restTemplate;

    public SupabaseStorageService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
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

        // Build upload URL for Supabase Storage API
        String uploadUrl = SUPABASE_URL + "/storage/v1/object/" + BUCKET_NAME + "/" + storageKey;

        // Prepare headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

        try {
            System.out.println("Uploading file to Supabase: " + uploadUrl);
            System.out.println("File size: " + file.getSize() + " bytes");
            
            // Create request with file bytes
            HttpEntity<byte[]> request = new HttpEntity<>(file.getBytes(), headers);
            
            // Upload to Supabase
            ResponseEntity<String> response = restTemplate.exchange(
                uploadUrl,
                HttpMethod.POST,
                request,
                String.class
            );

            System.out.println("Supabase response status: " + response.getStatusCode());
            System.out.println("Supabase response body: " + response.getBody());

            if (!response.getStatusCode().is2xxSuccessful()) {
                String errorMsg = "Failed to upload file to Supabase: HTTP " + response.getStatusCode() + " - " + response.getBody();
                System.err.println(errorMsg);
                throw new RuntimeException(errorMsg);
            }

            System.out.println("File uploaded successfully to Supabase: " + storageKey);
            
            // Return the storage key (what we'll store in the database)
            return storageKey;
            
        } catch (RestClientException e) {
            String errorMsg = "RestClient error uploading to Supabase: " + e.getMessage();
            System.err.println(errorMsg);
            e.printStackTrace();
            throw new RuntimeException(errorMsg, e);
        } catch (Exception e) {
            String errorMsg = "Error uploading to Supabase: " + e.getMessage();
            System.err.println(errorMsg);
            e.printStackTrace();
            throw new RuntimeException(errorMsg, e);
        }
    }
}
