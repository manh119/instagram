package com.engineerpro.example.redis.service;

import io.minio.GetPresignedObjectUrlArgs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class PreSignedUrlService {
    
    private static final Logger logger = LoggerFactory.getLogger(PreSignedUrlService.class);
    
    @Autowired
    private io.minio.MinioClient minioClient;
    
    // Use hardcoded bucket names like existing code
    private final String bucketName = "spring-boot";
    private final String postsBucketName = "spring-boot";
    
    /**
     * Generate pre-signed URL for image upload
     */
    public PreSignedUrlResponse generateImageUploadUrl(String fileName, String contentType) {
        try {
            logger.info("=== Generating Pre-signed URL for Image Upload ===");
            logger.info("File Name: {}", fileName);
            logger.info("Content Type: {}", contentType);
            logger.info("Bucket: {}", postsBucketName);
            
            // Generate unique file name to prevent conflicts
            String uniqueFileName = generateUniqueFileName(fileName);
            String objectKey = "posts/" + uniqueFileName;
            
            // Generate pre-signed URL using PUT method directly
            String uploadUrl = minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(io.minio.http.Method.PUT)
                    .bucket(postsBucketName)
                    .object(objectKey)
                    .expiry(15, TimeUnit.MINUTES)
                    .build()
            );
            
            PreSignedUrlResponse response = PreSignedUrlResponse.builder()
                .uploadUrl(uploadUrl)
                .objectKey(objectKey)
                .bucketName(postsBucketName)
                .expiresIn(15 * 60) // 15 minutes in seconds
                .formData(Map.of()) // Empty map since we're using PUT method
                .build();
            
            logger.info("=== Pre-signed URL Generated Successfully ===");
            logger.info("Object Key: {}", objectKey);
            logger.info("Expires In: {} seconds", response.getExpiresIn());
            
            return response;
            
        } catch (Exception e) {
            logger.error("=== Failed to Generate Pre-signed URL ===");
            logger.error("Error: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate pre-signed URL", e);
        }
    }
    
    /**
     * Generate pre-signed URL for profile image upload
     */
    public PreSignedUrlResponse generateProfileImageUploadUrl(String fileName, String contentType) {
        try {
            logger.info("=== Generating Pre-signed URL for Profile Image Upload ===");
            logger.info("File Name: {}", fileName);
            logger.info("Content Type: {}", contentType);
            logger.info("Bucket: {}", bucketName);
            
            // Generate unique file name
            String uniqueFileName = generateUniqueFileName(fileName);
            String objectKey = "profiles/" + uniqueFileName;
            
            // Generate pre-signed URL using PUT method directly
            
            // Generate pre-signed URL using PUT method directly
            String uploadUrl = minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(io.minio.http.Method.PUT)
                    .bucket(bucketName)
                    .object(objectKey)
                    .expiry(15, TimeUnit.MINUTES)
                    .build()
            );
            
            PreSignedUrlResponse response = PreSignedUrlResponse.builder()
                .uploadUrl(uploadUrl)
                .objectKey(objectKey)
                .bucketName(bucketName)
                .expiresIn(15 * 60)
                .formData(Map.of()) // Empty map since we're using PUT method
                .build();
            
            logger.info("=== Profile Image Pre-signed URL Generated Successfully ===");
            logger.info("Object Key: {}", objectKey);
            
            return response;
            
        } catch (Exception e) {
            logger.error("=== Failed to Generate Profile Image Pre-signed URL ===");
            logger.error("Error: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate profile image pre-signed URL", e);
        }
    }
    
    /**
     * Generate unique file name to prevent conflicts
     */
    private String generateUniqueFileName(String originalFileName) {
        String extension = "";
        if (originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        
        // Generate a shorter unique ID (8 characters instead of 32)
        String shortId = UUID.randomUUID().toString().substring(0, 8);
        
        // Create a clean filename: timestamp_shortId.extension
        String timestamp = String.valueOf(System.currentTimeMillis());
        
        return timestamp + "_" + shortId + extension;
    }
    
    /**
     * Response DTO for pre-signed URL
     */
    public static class PreSignedUrlResponse {
        private String uploadUrl;
        private String objectKey;
        private String bucketName;
        private int expiresIn;
        private Map<String, String> formData;
        
        // Builder pattern
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private PreSignedUrlResponse response = new PreSignedUrlResponse();
            
            public Builder uploadUrl(String uploadUrl) {
                response.uploadUrl = uploadUrl;
                return this;
            }
            
            public Builder objectKey(String objectKey) {
                response.objectKey = objectKey;
                return this;
            }
            
            public Builder bucketName(String bucketName) {
                response.bucketName = bucketName;
                return this;
            }
            
            public Builder expiresIn(int expiresIn) {
                response.expiresIn = expiresIn;
                return this;
            }
            
            public Builder formData(Map<String, String> formData) {
                response.formData = formData;
                return this;
            }
            
            public PreSignedUrlResponse build() {
                return response;
            }
        }
        
        // Getters
        public String getUploadUrl() { return uploadUrl; }
        public String getObjectKey() { return objectKey; }
        public String getBucketName() { return bucketName; }
        public int getExpiresIn() { return expiresIn; }
        public Map<String, String> getFormData() { return formData; }
        
        // Setters
        public void setUploadUrl(String uploadUrl) { this.uploadUrl = uploadUrl; }
        public void setObjectKey(String objectKey) { this.objectKey = objectKey; }
        public void setBucketName(String bucketName) { this.bucketName = bucketName; }
        public void setExpiresIn(int expiresIn) { this.expiresIn = expiresIn; }
        public void setFormData(Map<String, String> formData) { this.formData = formData; }
    }
}
