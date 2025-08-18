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
  private String base64ImageString;
  private String base64VideoString;
  
  @Length(min = 0, max = 2000, message = "Caption must be between 0 and 2000 characters")
  private String caption;
  
  // Helper methods for logging
  public boolean hasImage() {
    return base64ImageString != null && !base64ImageString.trim().isEmpty();
  }
  
  public boolean hasVideo() {
    return base64VideoString != null && !base64VideoString.trim().isEmpty();
  }
  
  public boolean hasMedia() {
    return hasImage() || hasVideo();
  }
  
  public int getImageLength() {
    return hasImage() ? base64ImageString.length() : 0;
  }
  
  public int getVideoLength() {
    return hasVideo() ? base64VideoString.length() : 0;
  }
  
  public String getVideoFormat() {
    if (!hasVideo()) return "none";
    
    if (base64VideoString.startsWith("data:video/mp4;base64")) return "MP4";
    if (base64VideoString.startsWith("data:video/quicktime;base64")) return "MOV";
    if (base64VideoString.startsWith("data:video/webm;base64")) return "WebM";
    if (base64VideoString.startsWith("data:video/x-msvideo;base64")) return "AVI";
    
    return "unknown";
  }
}
