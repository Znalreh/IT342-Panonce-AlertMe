package edu.cit.panonce.alertme.media.controller;

import edu.cit.panonce.alertme.alert.entity.AlertMedia;
import edu.cit.panonce.alertme.alert.repository.AlertMediaRepository;
import org.springframework.core.io.PathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/media")
public class MediaController {

    private final AlertMediaRepository alertMediaRepository;

    public MediaController(AlertMediaRepository alertMediaRepository) {
        this.alertMediaRepository = alertMediaRepository;
    }

    @GetMapping("/{mediaId}")
    public ResponseEntity<?> getMedia(@PathVariable String mediaId) {
        try {
            UUID uuid = UUID.fromString(mediaId);
            AlertMedia media = alertMediaRepository.findById(uuid).orElse(null);
            if (media == null) {
                return ResponseEntity.notFound().build();
            }

            String storageKey = media.getStorageKey();
            if (storageKey == null || storageKey.isBlank()) {
                return ResponseEntity.notFound().build();
            }

            if (storageKey.startsWith("local/")) {
                Path localFile = Paths.get("uploads", "alerts", storageKey);
                if (!Files.exists(localFile)) {
                    return ResponseEntity.notFound().build();
                }

                MediaType contentType = MediaType.APPLICATION_OCTET_STREAM;
                if (media.getMimeType() != null && !media.getMimeType().isBlank()) {
                    try {
                        contentType = MediaType.parseMediaType(media.getMimeType());
                    } catch (Exception ignored) {
                        contentType = MediaType.APPLICATION_OCTET_STREAM;
                    }
                }

                return ResponseEntity.ok()
                    .contentType(contentType)
                    .body(new PathResource(localFile));
            }

            // Redirect to Supabase public URL
            String supabaseUrl = "https://rjnshudkyinfhwyrxbmh.supabase.co/storage/v1/object/public/alerts/" + storageKey;
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, supabaseUrl)
                    .build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid media ID"));
        }
    }

}
