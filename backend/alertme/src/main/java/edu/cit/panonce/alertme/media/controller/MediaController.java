package edu.cit.panonce.alertme.media.controller;

import edu.cit.panonce.alertme.alert.entity.AlertMedia;
import edu.cit.panonce.alertme.alert.repository.AlertMediaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

            // Redirect to Supabase public URL
            String supabaseUrl = "https://rjnshudkyinfhwyrxbmh.supabase.co/storage/v1/object/public/alerts/" + media.getStorageKey();
            
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", supabaseUrl)
                    .build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid media ID"));
        }
    }
}
