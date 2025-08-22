package com.engineerpro.example.redis.controller;

import com.engineerpro.example.redis.service.PreSignedUrlService;
import com.engineerpro.example.redis.util.LoggingUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;

import java.util.Map;

@RestController
@RequestMapping("/api/presigned")
public class PreSignedUrlController {
    
    private static final Logger logger = LoggingUtil.getLogger(PreSignedUrlController.class);
    
    @Autowired
    private PreSignedUrlService preSignedUrlService;
    
    /**
     * Generate pre-signed URL for post image upload
     */
    @PostMapping("/upload/post-image")
    public ResponseEntity<?> generatePostImageUploadUrl(
            @RequestBody PostImageUploadRequest request,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        
        try {
            logger.info("=== Post Image Upload URL Request ===");
            logger.info("User: {}", userDetails.getUsername());
            logger.info("File Name: {}", request.getFileName());
            logger.info("Content Type: {}", request.getContentType());
            
            // Validate request
            if (request.getFileName() == null || request.getFileName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File name is required"));
            }
            
            if (request.getContentType() == null || request.getContentType().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Content type is required"));
            }
            
            // Validate file type
            if (!isValidImageType(request.getContentType())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid image type. Only images are allowed"));
            }
            
            // Generate pre-signed URL
            PreSignedUrlService.PreSignedUrlResponse response = 
                preSignedUrlService.generateImageUploadUrl(request.getFileName(), request.getContentType());
            
            logger.info("=== Post Image Upload URL Generated Successfully ===");
            logger.info("Object Key: {}", response.getObjectKey());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("=== Failed to Generate Post Image Upload URL ===");
            logger.error("Error: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to generate upload URL"));
        }
    }
    
    /**
     * Generate pre-signed URL for profile image upload
     */
    @PostMapping("/upload/profile-image")
    public ResponseEntity<?> generateProfileImageUploadUrl(
            @RequestBody ProfileImageUploadRequest request,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        
        try {
            logger.info("=== Profile Image Upload URL Request ===");
            logger.info("User: {}", userDetails.getUsername());
            logger.info("File Name: {}", request.getFileName());
            logger.info("Content Type: {}", request.getContentType());
            
            // Validate request
            if (request.getFileName() == null || request.getFileName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File name is required"));
            }
            
            if (request.getContentType() == null || request.getContentType().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Content type is required"));
            }
            
            // Validate file type
            if (!isValidImageType(request.getContentType())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid image type. Only images are allowed"));
            }
            
            // Generate pre-signed URL
            PreSignedUrlService.PreSignedUrlResponse response = 
                preSignedUrlService.generateProfileImageUploadUrl(request.getFileName(), request.getContentType());
            
            logger.info("=== Profile Image Upload URL Generated Successfully ===");
            logger.info("Object Key: {}", response.getObjectKey());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("=== Failed to Generate Profile Image Upload URL ===");
            logger.error("Error: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to generate upload URL"));
        }
    }
    
    /**
     * Validate if content type is a valid image type
     */
    private boolean isValidImageType(String contentType) {
        if (contentType == null) return false;
        
        String lowerContentType = contentType.toLowerCase();
        return lowerContentType.startsWith("image/") && 
               (lowerContentType.contains("jpeg") || 
                lowerContentType.contains("jpg") || 
                lowerContentType.contains("png") || 
                lowerContentType.contains("gif") || 
                lowerContentType.contains("webp"));
    }
    
    /**
     * Request DTO for post image upload
     */
    public static class PostImageUploadRequest {
        private String fileName;
        private String contentType;
        
        // Getters
        public String getFileName() { return fileName; }
        public String getContentType() { return contentType; }
        
        // Setters
        public void setFileName(String fileName) { this.fileName = fileName; }
        public void setContentType(String contentType) { this.contentType = contentType; }
    }
    
    /**
     * Request DTO for profile image upload
     */
    public static class ProfileImageUploadRequest {
        private String fileName;
        private String contentType;
        
        // Getters
        public String getFileName() { return fileName; }
        public String getContentType() { return contentType; }
        
        // Setters
        public void setFileName(String fileName) { this.fileName = fileName; }
        public void setContentType(String contentType) { this.contentType = contentType; }
    }
}
