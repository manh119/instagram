package com.engineerpro.example.redis.dto.feed;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class PostUploadUrlRequest {
    private String fileName;
    private String contentType;
    
    // Helper methods for logging
    public boolean hasFileName() {
        return fileName != null && !fileName.trim().isEmpty();
    }
    
    public boolean hasContentType() {
        return contentType != null && !contentType.trim().isEmpty();
    }
    
    public boolean isValid() {
        return hasFileName() && hasContentType();
    }
}
