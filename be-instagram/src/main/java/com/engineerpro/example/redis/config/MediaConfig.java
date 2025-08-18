package com.engineerpro.example.redis.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "media")
public class MediaConfig {
    
    private String baseUrl = "http://localhost:8080";
    private Images images = new Images();
    private Videos videos = new Videos();
    
    public static class Images {
        private String path = "/images";
        
        public String getPath() {
            return path;
        }
        
        public void setPath(String path) {
            this.path = path;
        }
    }
    
    public static class Videos {
        private String path = "/videos";
        
        public String getPath() {
            return path;
        }
        
        public void setPath(String path) {
            this.path = path;
        }
    }
    
    public String getBaseUrl() {
        return baseUrl;
    }
    
    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }
    
    public Images getImages() {
        return images;
    }
    
    public void setImages(Images images) {
        this.images = images;
    }
    
    public Videos getVideos() {
        return videos;
    }
    
    public void setVideos(Videos videos) {
        this.videos = videos;
    }
    
    public String getImageUrl(String filename) {
        return baseUrl + images.getPath() + "/" + filename;
    }
    
    public String getVideoUrl(String filename) {
        return baseUrl + videos.getPath() + "/" + filename;
    }
}
