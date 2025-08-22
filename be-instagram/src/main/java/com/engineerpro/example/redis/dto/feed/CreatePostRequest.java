package com.engineerpro.example.redis.dto.feed;

import org.hibernate.validator.constraints.Length;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class CreatePostRequest {
  // Legacy base64 fields (for backward compatibility)
  private String base64ImageString;
  private String base64VideoString;
  
  // New URL-based fields
  private String imageUrl;
  private String videoUrl;
  
  @Length(min = 0, max = 2000, message = "Caption must be between 0 and 2000 characters")
  private String caption;
  
  // Helper methods for logging
  public boolean hasImage() {
    return (base64ImageString != null && !base64ImageString.trim().isEmpty()) ||
           (imageUrl != null && !imageUrl.trim().isEmpty());
  }
  
  public boolean hasVideo() {
    return (base64VideoString != null && !base64VideoString.trim().isEmpty()) ||
           (videoUrl != null && !videoUrl.trim().isEmpty());
  }
  
  public boolean hasMedia() {
    return hasImage() || hasVideo();
  }
  
  public boolean hasBase64Image() {
    return base64ImageString != null && !base64ImageString.trim().isEmpty();
  }
  
  public boolean hasBase64Video() {
    return base64VideoString != null && !base64VideoString.trim().isEmpty();
  }
  
  public boolean hasImageUrl() {
    return imageUrl != null && !imageUrl.trim().isEmpty();
  }
  
  public boolean hasVideoUrl() {
    return videoUrl != null && !videoUrl.trim().isEmpty();
  }
  
  public int getImageLength() {
    if (hasBase64Image()) {
      return base64ImageString.length();
    } else if (hasImageUrl()) {
      return imageUrl.length();
    }
    return 0;
  }
  
  public int getVideoLength() {
    if (hasBase64Video()) {
      return base64VideoString.length();
    } else if (hasVideoUrl()) {
      return videoUrl.length();
    }
    return 0;
  }
  
  public String getVideoFormat() {
    if (!hasVideo()) return "none";
    
    if (hasBase64Video()) {
      if (base64VideoString.startsWith("data:video/mp4;base64")) return "MP4";
      if (base64VideoString.startsWith("data:video/quicktime;base64")) return "MOV";
      if (base64VideoString.startsWith("data:video/webm;base64")) return "WebM";
      if (base64VideoString.startsWith("data:video/x-msvideo;base64")) return "AVI";
    } else if (hasVideoUrl()) {
      if (videoUrl.endsWith(".mp4")) return "MP4";
      if (videoUrl.endsWith(".mov")) return "MOV";
      if (videoUrl.endsWith(".webm")) return "WebM";
      if (videoUrl.endsWith(".avi")) return "AVI";
    }
    
    return "unknown";
  }
}
