package com.engineerpro.example.redis.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

  private static final Logger log = LoggerFactory.getLogger(MinioConfig.class);

  @Value("${spring.io.minio.endpoint}")
  private String minioEndpoint;

  @Value("${spring.io.minio.external-endpoint}")
  private String externalMinioEndpoint;

  @Value("${spring.io.minio.access-key}")
  private String minioAccessKey;

  @Value("${spring.io.minio.secret-key}")
  private String minioSecretKey;

  @Value("${minio.bucket-name:my-bucket}")
  private String defaultBucket;

  /**
   * Default MinIO client for internal use (backend ↔ MinIO inside Docker).
   */
  @Bean
  public MinioClient minioClient() {
    MinioClient client = MinioClient.builder()
        .endpoint(minioEndpoint)
        .credentials(minioAccessKey, minioSecretKey)
        .build();

    createBucketIfNotExists(client, defaultBucket);

    return client;
  }

  /**
   * MinIO client for generating presigned URLs (frontend/browser access).
   */
  @Bean(name = "presignedUrlMinioClient")
  public MinioClient presignedUrlMinioClient() {
    log.info("MinIO Presigned URL Client Configured:");
    log.info("  External Endpoint: {}", externalMinioEndpoint);
    log.info("  Access Key: {}", maskKey(minioAccessKey));

    return MinioClient.builder()
        .endpoint(externalMinioEndpoint)
        .credentials(minioAccessKey, minioSecretKey)
        .build();
  }

  private String maskKey(String key) {
    if (key == null || key.isEmpty())
      return "empty";
    if (key.length() <= 4)
      return "****";
    return key.substring(0, 2) + "****" + key.substring(key.length() - 2);
  }

  private void createBucketIfNotExists(MinioClient client, String bucketName) {
    try {
      boolean exists = client.bucketExists(
          BucketExistsArgs.builder().bucket(bucketName).build());

      if (!exists) {
        client.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        log.info("✅ MinIO bucket '{}' created.", bucketName);
      } else {
        log.info("ℹ️ MinIO bucket '{}' already exists.", bucketName);
      }
    } catch (Exception e) {
      log.error("❌ Failed to create/check MinIO bucket '{}': {}", bucketName, e.getMessage(), e);
    }
  }
}
