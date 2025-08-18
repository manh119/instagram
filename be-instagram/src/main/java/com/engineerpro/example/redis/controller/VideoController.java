package com.engineerpro.example.redis.controller;

import java.io.InputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.engineerpro.example.redis.util.LoggingUtil;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.errors.ErrorResponseException;
import org.slf4j.Logger;

@RestController
@RequestMapping("/videos")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:8080"})
public class VideoController {

    private static final Logger logger = LoggingUtil.getLogger(VideoController.class);

    @Autowired
    private MinioClient minioClient;

    @GetMapping("/{filename}")
    public ResponseEntity<InputStreamResource> getVideo(@PathVariable String filename) {
        LoggingUtil.logControllerEntry(logger, "getVideo", "filename", filename);
        
        try {
            // Log video request details
            String fileExtension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
            LoggingUtil.logServiceDebug(logger, "Video request received", 
                "filename", filename, 
                "extension", fileExtension);
            
            // Get object from MinIO
            InputStream stream = minioClient.getObject(
                GetObjectArgs.builder()
                    .bucket("spring-boot")
                    .object(filename)
                    .build()
            );

            // Determine content type based on file extension
            String contentType = determineContentType(filename);
            LoggingUtil.logServiceDebug(logger, "Video retrieved successfully from MinIO", 
                "filename", filename, 
                "contentType", contentType,
                "extension", fileExtension);

            // Return the video as a stream
            ResponseEntity<InputStreamResource> response = ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000") // Cache for 1 year
                .body(new InputStreamResource(stream));

            LoggingUtil.logControllerExit(logger, "getVideo", 
                "Video served successfully - filename: " + filename + ", contentType: " + contentType);
            return response;

        } catch (ErrorResponseException e) {
            LoggingUtil.logControllerError(logger, "getVideo", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            LoggingUtil.logControllerError(logger, "getVideo", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private String determineContentType(String filename) {
        if (filename.endsWith(".mp4")) {
            return "video/mp4";
        } else if (filename.endsWith(".mov")) {
            return "video/quicktime";
        } else if (filename.endsWith(".webm")) {
            return "video/webm";
        } else if (filename.endsWith(".avi")) {
            return "video/x-msvideo";
        } else {
            return "video/mp4"; // default
        }
    }
}
