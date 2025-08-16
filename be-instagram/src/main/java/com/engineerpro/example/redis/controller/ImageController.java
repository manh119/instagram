package com.engineerpro.example.redis.controller;

import java.io.InputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.engineerpro.example.redis.util.LoggingUtil;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.errors.ErrorResponseException;
import org.slf4j.Logger;

@RestController
@RequestMapping("/images")
public class ImageController {

    private static final Logger logger = LoggingUtil.getLogger(ImageController.class);

    @Autowired
    private MinioClient minioClient;

    @GetMapping("/{filename}")
    public ResponseEntity<InputStreamResource> getImage(@PathVariable String filename) {
        LoggingUtil.logControllerEntry(logger, "getImage", "filename", filename);
        
        try {
            // Get object from MinIO
            InputStream stream = minioClient.getObject(
                GetObjectArgs.builder()
                    .bucket("spring-boot")
                    .object(filename)
                    .build()
            );

            // Determine content type based on file extension
            String contentType = determineContentType(filename);
            LoggingUtil.logServiceDebug(logger, "Image retrieved successfully", "filename", filename, "contentType", contentType);

            // Return the image as a stream
            ResponseEntity<InputStreamResource> response = ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000") // Cache for 1 year
                .body(new InputStreamResource(stream));

            LoggingUtil.logControllerExit(logger, "getImage", "Image served successfully");
            return response;

        } catch (ErrorResponseException e) {
            LoggingUtil.logControllerError(logger, "getImage", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            LoggingUtil.logControllerError(logger, "getImage", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private String determineContentType(String filename) {
        if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (filename.endsWith(".png")) {
            return "image/png";
        } else if (filename.endsWith(".gif")) {
            return "image/gif";
        } else if (filename.endsWith(".webp")) {
            return "image/webp";
        } else {
            return "application/octet-stream";
        }
    }
}

