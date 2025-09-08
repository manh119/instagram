package com.engineerpro.example.redis.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.engineerpro.example.redis.dto.notification.NotificationResponse;
import com.engineerpro.example.redis.model.Notification;
import com.engineerpro.example.redis.model.Profile;
import com.engineerpro.example.redis.util.LoggingUtil;

import org.slf4j.Logger;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Service
public class NotificationWebSocketService {

    private static final Logger logger = LoggingUtil.getLogger(NotificationWebSocketService.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private final ObjectMapper objectMapper;

    private static final String NOTIFICATION_CHANNEL_PREFIX = "notification:";

    public NotificationWebSocketService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Send notification to a specific user via WebSocket
     */
    public void sendNotificationToUser(Long userId, NotificationResponse notification) {
        try {
            logger.info("=== WebSocket Notification Send Request ===");
            logger.info("User ID: {}", userId);
            logger.info("Notification ID: {}", notification.getId());
            logger.info("Notification Type: {}", notification.getType());
            logger.info("Notification Message: {}", notification.getMessage());

            String destination = "/queue/user." + userId + ".notifications";
            logger.info("WebSocket Destination: {}", destination);

            messagingTemplate.convertAndSend(
                destination,
                notification
            );

            logger.info("=== WebSocket Message Sent Successfully ===");
            logger.info("Message sent to destination: {}", destination);

            // Also publish to Redis for other instances to pick up
            // publishNotificationToRedis(userId, notification);

            logger.info("=== WebSocket Notification Complete ===");
            logger.info("Notification sent via WebSocket and Redis");

            LoggingUtil.logBusinessEvent(logger, "Notification sent via WebSocket",
                    "UserId", userId, "NotificationId", notification.getId());

        } catch (Exception e) {
            logger.error("=== WebSocket Notification Send Failed ===");
            logger.error("Failed to send notification to user: {}", userId, e);
            LoggingUtil.logServiceWarning(logger, "Failed to send notification via WebSocket",
                    "UserId", userId, "NotificationId", notification.getId(), "Error", e.getMessage());
        }
    }

    /**
     * Send notification to a specific user via WebSocket using Profile
     */
    public void sendNotificationToUser(Profile profile, NotificationResponse notification) {
        if (profile != null) {
            sendNotificationToUser((long) profile.getId(), notification);
        }
    }

    /**
     * Send notification to a specific user via WebSocket using Profile ID
     */
    public void sendNotificationToUser(Profile profile, Notification notification) {
        if (profile != null) {
            NotificationResponse response = convertToResponse(notification);
            sendNotificationToUser((long) profile.getId(), response);
        }
    }

    /**
     * Publish notification to Redis for other instances to consume
     */
    private void publishNotificationToRedis(Long userId, NotificationResponse notification) {
        try {
            String channel = NOTIFICATION_CHANNEL_PREFIX + userId;
            String message = objectMapper.writeValueAsString(notification);
            redisTemplate.convertAndSend(channel, message);

            LoggingUtil.logBusinessEvent(logger, "Notification published to Redis",
                    "UserId", userId, "Channel", channel);

        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to publish notification to Redis",
                    "UserId", userId, "Error", e.getMessage());
        }
    }

    /**
     * Send unread count update to user
     */
    public void sendUnreadCountUpdate(Long userId, long unreadCount) {
        try {
            logger.info("=== WebSocket Unread Count Update Request ===");
            logger.info("User ID: {}", userId);
            logger.info("Unread Count: {}", unreadCount);

            String destination = "/queue/user." + userId + ".unread-count";
            logger.info("WebSocket Destination: {}", destination);

            messagingTemplate.convertAndSend(
                    destination,
                    new UnreadCountUpdate(unreadCount));

            logger.info("=== WebSocket Unread Count Update Success ===");
            logger.info("Unread count update sent to user: {}", userId);

            LoggingUtil.logBusinessEvent(logger, "Unread count update sent",
                    "UserId", userId, "Count", unreadCount);

        } catch (Exception e) {
            logger.error("=== WebSocket Unread Count Update Failed ===");
            logger.error("Failed to send unread count update to user: {}", userId, e);
            LoggingUtil.logServiceWarning(logger, "Failed to send unread count update",
                    "UserId", userId, "Error", e.getMessage());
        }
    }

    /**
     * Send unread count update to user using Profile
     */
    public void sendUnreadCountUpdate(Profile profile, long unreadCount) {
        if (profile != null) {
            sendUnreadCountUpdate((long) profile.getId(), unreadCount);
        }
    }

    /**
     * Convert Notification entity to NotificationResponse DTO
     */
    private NotificationResponse convertToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType().name())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .senderId(notification.getSender() != null ? notification.getSender().getId() : null)
                .senderUsername(notification.getSender() != null ? notification.getSender().getUsername() : null)
                .senderProfileImageUrl(
                        notification.getSender() != null ? notification.getSender().getProfileImageUrl() : null)
                .relatedPostId(notification.getRelatedPostId())
                .relatedCommentId(notification.getRelatedCommentId())
                .build();
    }

    /**
     * Inner class for unread count updates
     */
    public static class UnreadCountUpdate {
        private long count;

        public UnreadCountUpdate(long count) {
            this.count = count;
        }

        public long getCount() {
            return count;
        }

        public void setCount(long count) {
            this.count = count;
        }
    }
}
