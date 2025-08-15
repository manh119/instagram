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

import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.errors.ErrorResponseException;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/images")
@Slf4j
public class ImageController {

    @Autowired
    private MinioClient minioClient;

    @GetMapping("/{filename}")
    public ResponseEntity<InputStreamResource> getImage(@PathVariable String filename) {
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

            // Return the image as a stream
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000") // Cache for 1 year
                .body(new InputStreamResource(stream));

        } catch (ErrorResponseException e) {
            log.error("Image not found: {}", filename, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error serving image: {}", filename, e);
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
