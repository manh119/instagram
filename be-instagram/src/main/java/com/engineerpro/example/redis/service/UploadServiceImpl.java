package com.engineerpro.example.redis.service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Base64;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.engineerpro.example.redis.util.LoggingUtil;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.slf4j.Logger;

@Service
public class UploadServiceImpl implements UploadService {
  
  private static final Logger logger = LoggingUtil.getLogger(UploadServiceImpl.class);
  
  @Autowired
  MinioClient minioClient;

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

  @Override
  public String uploadImage(String base64) {
    LoggingUtil.logBusinessEvent(logger, "Starting image upload");
    
    try {
      String fileName = String.format("%s.%s", UUID.randomUUID().toString(), this.getFileExtension(base64));
      LoggingUtil.logServiceDebug(logger, "Generated filename", "fileName", fileName);
      
      minioClient.putObject(PutObjectArgs.builder().bucket("spring-boot")
          .object(fileName)
          .stream(this.getImageFromBase64(base64), -1, 5242880).build());
      
      LoggingUtil.logBusinessEvent(logger, "Image uploaded successfully", "fileName", fileName);
      
      // Return full URL that frontend can access
      String imageUrl = String.format("http://localhost:8080/images/%s", fileName);
      LoggingUtil.logServiceDebug(logger, "Image URL generated", "imageUrl", imageUrl);
      
      return imageUrl;
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to upload image", "Error", e.getMessage());
      logger.error("Error when upload image", e);
      return null;
    }
  }
}
