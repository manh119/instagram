package com.engineerpro.example.redis.service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Base64;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.engineerpro.example.redis.config.MediaConfig;
import com.engineerpro.example.redis.util.LoggingUtil;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.slf4j.Logger;

@Service
public class UploadServiceImpl implements UploadService {

  private static final Logger logger = LoggingUtil.getLogger(UploadServiceImpl.class);

  @Autowired
  MinioClient minioClient;

  @Autowired
  MediaConfig mediaConfig;

  @Value("${spring.io.minio.bucket-name}")
  private String bucketName;

  private String getFileExtension(String base64String) {
    String[] strings = base64String.split(",");
    String extension;
    switch (strings[0]) { // check image's extension
      case "data:image/jpeg;base64":
        extension = "jpeg";
        break;
      case "data:image/png;base64":
        extension = "png";
        break;
      case "data:video/mp4;base64":
        extension = "mp4";
        break;
      case "data:video/quicktime;base64":
        extension = "mov";
        break;
      case "data:video/webm;base64":
        extension = "webm";
        break;
      default: // should write cases for more images types
        extension = "jpg";
        break;
    }
    LoggingUtil.logServiceDebug(logger, "File extension determined", "extension", extension);
    return extension;
  }

  private InputStream getImageFromBase64(String base64String) {
    String[] strings = base64String.split(",");
    // byte[] data = DatatypeConverter.parseBase64Binary(strings[1]);
    byte[] data = Base64.getDecoder().decode(strings[1]);
    LoggingUtil.logServiceDebug(logger, "Base64 image decoded", "dataLength", data.length);
    return new ByteArrayInputStream(data);
  }

  private InputStream getVideoFromBase64(String base64String) {
    String[] strings = base64String.split(",");
    byte[] data = Base64.getDecoder().decode(strings[1]);
    LoggingUtil.logServiceDebug(logger, "Base64 video decoded", "dataLength", data.length);
    return new ByteArrayInputStream(data);
  }

  @Override
  public String uploadImage(String base64) {
    LoggingUtil.logBusinessEvent(logger, "Starting image upload");

    try {
      String fileName = String.format("%s.%s", UUID.randomUUID().toString(), this.getFileExtension(base64));
      LoggingUtil.logServiceDebug(logger, "Generated filename", "fileName", fileName);

      minioClient.putObject(PutObjectArgs.builder().bucket(bucketName)
          .object(fileName)
          .stream(this.getImageFromBase64(base64), -1, 5242880).build());

      LoggingUtil.logBusinessEvent(logger, "Image uploaded successfully", "fileName", fileName);

      // Return full URL that frontend can access
      String imageUrl = mediaConfig.getImageUrl(fileName);
      LoggingUtil.logServiceDebug(logger, "Image URL generated", "imageUrl", imageUrl);

      return imageUrl;
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to upload image", "Error", e.getMessage());
      logger.error("Error when upload image", e);
      return null;
    }
  }

  @Override
  public String uploadVideo(String base64) {
    LoggingUtil.logBusinessEvent(logger, "Starting video upload");

    try {
      // Log video metadata
      String videoFormat = getFileExtension(base64);
      int videoSizeBytes = getVideoFromBase64(base64).available();
      double videoSizeMB = videoSizeBytes / (1024.0 * 1024.0);

      LoggingUtil.logServiceDebug(logger, "Video upload details",
          "Format", videoFormat,
          "Size (bytes)", videoSizeBytes,
          "Size (MB)", String.format("%.2f", videoSizeMB));

      // Validate video size (100MB limit)
      if (videoSizeMB > 100) {
        LoggingUtil.logServiceWarning(logger, "Video file too large",
            "Size (MB)", String.format("%.2f", videoSizeMB),
            "Limit (MB)", 100);
        throw new IllegalArgumentException("Video file size exceeds 100MB limit");
      }

      String fileName = String.format("%s.%s", UUID.randomUUID().toString(), videoFormat);
      LoggingUtil.logServiceDebug(logger, "Generated video filename", "fileName", fileName);

      // Upload to MinIO
      minioClient.putObject(PutObjectArgs.builder().bucket(bucketName)
          .object(fileName)
          .stream(getVideoFromBase64(base64), -1, 104857600).build()); // 100MB limit for videos

      LoggingUtil.logBusinessEvent(logger, "Video uploaded successfully to MinIO",
          "fileName", fileName,
          "format", videoFormat,
          "sizeMB", String.format("%.2f", videoSizeMB));

      // Return full URL that frontend can access
      String videoUrl = mediaConfig.getVideoUrl(fileName);
      LoggingUtil.logServiceDebug(logger, "Video URL generated", "videoUrl", videoUrl);

      return videoUrl;
    } catch (IllegalArgumentException e) {
      LoggingUtil.logServiceWarning(logger, "Video upload validation failed", "Error", e.getMessage());
      throw e;
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to upload video", "Error", e.getMessage());
      logger.error("Error when upload video", e);
      return null;
    }
  }
}
