package com.engineerpro.example.redis.service;

public interface UploadService {
  String uploadImage(String base64);
  String uploadVideo(String base64);
}
