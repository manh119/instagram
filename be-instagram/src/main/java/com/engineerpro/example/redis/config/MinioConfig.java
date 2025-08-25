package com.engineerpro.example.redis.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.minio.MinioClient;

@Configuration
public class MinioConfig {
  
  @Bean
  public MinioClient minioClient() {
    // Use environment variables with Docker service names as fallback
    String minioEndpoint = System.getenv("MINIO_ENDPOINT");
    if (minioEndpoint == null || minioEndpoint.isEmpty()) {
      // In Docker environment, use the service name
      minioEndpoint = "http://minio:9000";
    }
    
    String minioAccessKey = System.getenv("MINIO_ACCESS_KEY");
    if (minioAccessKey == null || minioAccessKey.isEmpty()) {
      minioAccessKey = "minioadmin";
    }
    
    String minioSecretKey = System.getenv("MINIO_SECRET_KEY");
    if (minioSecretKey == null || minioSecretKey.isEmpty()) {
      minioSecretKey = "minioadmin";
    }
    
    // Add logging to help with debugging
    System.out.println("MinIO Configuration:");
    System.out.println("  Endpoint: " + minioEndpoint);
    System.out.println("  Access Key: " + minioAccessKey);
    System.out.println("  Secret Key: " + (minioSecretKey.length() > 0 ? "***" : "empty"));
    
    return MinioClient.builder()
        .endpoint(minioEndpoint)
        .credentials(minioAccessKey, minioSecretKey)
        .build();
  }
  
  /**
   * Bean for MinIO client that generates presigned URLs with external endpoint
   * This is needed because the frontend (browser) needs to access MinIO directly
   */
  @Bean(name = "presignedUrlMinioClient")
  public MinioClient presignedUrlMinioClient() {
    // For presigned URLs, always use the external endpoint that the frontend can access
    String externalMinioEndpoint = System.getenv("MINIO_EXTERNAL_ENDPOINT");
    if (externalMinioEndpoint == null || externalMinioEndpoint.isEmpty()) {
      // On Linux Docker, use the gateway IP to reach the host machine from inside the container
      externalMinioEndpoint = "http://172.19.0.1:9000";
    }
    
    String minioAccessKey = System.getenv("MINIO_ACCESS_KEY");
    if (minioAccessKey == null || minioAccessKey.isEmpty()) {
      minioAccessKey = "minioadmin";
    }
    
    String minioSecretKey = System.getenv("MINIO_SECRET_KEY");
    if (minioSecretKey == null || minioSecretKey.isEmpty()) {
      minioSecretKey = "minioadmin";
    }
    
    System.out.println("MinIO Presigned URL Configuration:");
    System.out.println("  External Endpoint: " + externalMinioEndpoint);
    System.out.println("  Access Key: " + minioAccessKey);
    System.out.println("  Secret Key: " + (minioSecretKey.length() > 0 ? "***" : "empty"));
    
    return MinioClient.builder()
        .endpoint(externalMinioEndpoint)
        .credentials(minioAccessKey, minioSecretKey)
        .build();
  }
}
