package com.engineerpro.example.redis.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import com.engineerpro.example.redis.dto.notification.NotificationResponse;
import com.engineerpro.example.redis.service.NotificationWebSocketService;
import com.engineerpro.example.redis.util.LoggingUtil;

import org.slf4j.Logger;

@Controller
public class WebSocketController {
    
    private static final Logger logger = LoggingUtil.getLogger(WebSocketController.class);
    
    @Autowired
    private NotificationWebSocketService notificationWebSocketService;
    
    /**
     * Handle WebSocket connection authentication
     */
    @MessageMapping("/auth")
    @SendToUser("/queue/auth-response")
    public AuthResponse authenticate(AuthRequest request, SimpMessageHeaderAccessor headerAccessor) {
        try {
            logger.info("=== WebSocket AUTH Request Received ===");
            logger.info("Request: {}", request);
            logger.info("Session ID: {}", headerAccessor.getSessionId());
            logger.info("User ID from request: {}", request.getUserId());
            
            // Extract user ID from the request
            Long userId = request.getUserId();
            
            if (userId != null) {
                // Store user ID in session attributes for future use
                headerAccessor.getSessionAttributes().put("userId", userId);
                
                logger.info("=== WebSocket AUTH Success ===");
                logger.info("User ID stored in session: {}", userId);
                logger.info("Session attributes: {}", headerAccessor.getSessionAttributes());
                
                LoggingUtil.logBusinessEvent(logger, "WebSocket user authenticated", 
                    "UserId", userId, "SessionId", headerAccessor.getSessionId());
                
                return new AuthResponse(true, "Authentication successful");
            } else {
                logger.warn("=== WebSocket AUTH Failed ===");
                logger.warn("Invalid user ID: {}", request.getUserId());
                return new AuthResponse(false, "Invalid user ID");
            }
            
        } catch (Exception e) {
            logger.error("=== WebSocket AUTH Exception ===");
            logger.error("Error during authentication: {}", e.getMessage(), e);
            LoggingUtil.logServiceWarning(logger, "WebSocket authentication failed", 
                "Error", e.getMessage());
            return new AuthResponse(false, "Authentication failed");
        }
    }
    
    /**
     * Handle notification acknowledgment
     */
    @MessageMapping("/notifications/ack")
    public void acknowledgeNotification(NotificationAckRequest request, SimpMessageHeaderAccessor headerAccessor) {
        try {
            Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");
            Long notificationId = request.getNotificationId();
            
            if (userId != null && notificationId != null) {
                LoggingUtil.logBusinessEvent(logger, "Notification acknowledged", 
                    "UserId", userId, "NotificationId", notificationId);
            }
            
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to acknowledge notification", 
                "Error", e.getMessage());
        }
    }
    
    /**
     * Handle ping/pong for connection health check
     */
    @MessageMapping("/ping")
    @SendToUser("/queue/pong")
    public PongResponse ping() {
        return new PongResponse(System.currentTimeMillis());
    }
    
    // Request/Response classes
    
    public static class AuthRequest {
        private Long userId;
        
        public Long getUserId() {
            return userId;
        }
        
        public void setUserId(Long userId) {
            this.userId = userId;
        }
    }
    
    public static class AuthResponse {
        private boolean success;
        private String message;
        
        public AuthResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
        
        public boolean isSuccess() {
            return success;
        }
        
        public void setSuccess(boolean success) {
            this.success = success;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
    
    public static class NotificationAckRequest {
        private Long notificationId;
        
        public Long getNotificationId() {
            return notificationId;
        }
        
        public void setNotificationId(Long notificationId) {
            this.notificationId = notificationId;
        }
    }
    
    public static class PongResponse {
        private long timestamp;
        
        public PongResponse(long timestamp) {
            this.timestamp = timestamp;
        }
        
        public long getTimestamp() {
            return timestamp;
        }
        
        public void setTimestamp(long timestamp) {
            this.timestamp = timestamp;
        }
    }
}
