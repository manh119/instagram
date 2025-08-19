package com.engineerpro.example.redis.controller.notification;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.engineerpro.example.redis.dto.notification.NotificationResponse;
import com.engineerpro.example.redis.model.Notification;
import com.engineerpro.example.redis.model.Profile;
import com.engineerpro.example.redis.repository.NotificationRepository;
import com.engineerpro.example.redis.service.profile.ProfileService;
import com.engineerpro.example.redis.util.LoggingUtil;

import org.slf4j.Logger;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger logger = LoggingUtil.getLogger(NotificationController.class);
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private ProfileService profileService;

    // Get all notifications for the current user with pagination
    @GetMapping
    public ResponseEntity<?> getNotifications(
            @AuthenticationPrincipal com.engineerpro.example.redis.dto.UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        
        try {
            LoggingUtil.logBusinessEvent(logger, "Fetching notifications", 
                "Username", userPrincipal.getUsername(), "Page", page, "Limit", limit);
            
            Profile profile = profileService.getUserProfile(userPrincipal);
            Pageable pageable = PageRequest.of(page - 1, limit);
            
            List<Notification> notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(profile);
            
            // Apply pagination manually since we're using custom query
            int start = (page - 1) * limit;
            int end = Math.min(start + limit, notifications.size());
            List<Notification> paginatedNotifications = notifications.subList(start, end);
            
            List<NotificationResponse> notificationResponses = paginatedNotifications.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
            
            LoggingUtil.logBusinessEvent(logger, "Notifications fetched successfully", 
                "Username", userPrincipal.getUsername(), "Count", notificationResponses.size());
            
            return ResponseEntity.ok(new NotificationListResponse(
                notificationResponses, 
                notifications.size(), 
                page, 
                limit,
                notifications.size() > end
            ));
            
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to fetch notifications", 
                "Username", userPrincipal.getUsername(), "Error", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to fetch notifications");
        }
    }

    // Get unread notifications count
    @GetMapping("/unread/count")
    public ResponseEntity<?> getUnreadCount(
            @AuthenticationPrincipal com.engineerpro.example.redis.dto.UserPrincipal userPrincipal) {
        
        try {
            LoggingUtil.logBusinessEvent(logger, "Fetching unread count", 
                "Username", userPrincipal.getUsername());
            
            Profile profile = profileService.getUserProfile(userPrincipal);
            long unreadCount = notificationRepository.countByRecipientAndIsReadFalse(profile);
            
            LoggingUtil.logBusinessEvent(logger, "Unread count fetched successfully", 
                "Username", userPrincipal.getUsername(), "Count", unreadCount);
            
            return ResponseEntity.ok(new UnreadCountResponse(unreadCount));
            
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to fetch unread count", 
                "Username", userPrincipal.getUsername(), "Error", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to fetch unread count");
        }
    }

    // Mark a notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @AuthenticationPrincipal com.engineerpro.example.redis.dto.UserPrincipal userPrincipal,
            @PathVariable Long id) {
        
        try {
            LoggingUtil.logBusinessEvent(logger, "Marking notification as read", 
                "Username", userPrincipal.getUsername(), "NotificationId", id);
            
            Profile profile = profileService.getUserProfile(userPrincipal);
            Notification notification = notificationRepository.findById(id)
                .orElse(null);
            
            if (notification == null) {
                LoggingUtil.logServiceWarning(logger, "Notification not found", 
                    "Username", userPrincipal.getUsername(), "NotificationId", id);
                return ResponseEntity.notFound().build();
            }
            
            if (notification.getRecipient().getId() != profile.getId()) {
                LoggingUtil.logServiceWarning(logger, "Unauthorized access to notification", 
                    "Username", userPrincipal.getUsername(), "NotificationId", id);
                return ResponseEntity.status(403).build();
            }
            
            notificationRepository.markAsReadById(id);
            
            LoggingUtil.logBusinessEvent(logger, "Notification marked as read successfully", 
                "Username", userPrincipal.getUsername(), "NotificationId", id);
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to mark notification as read", 
                "Username", userPrincipal.getUsername(), "NotificationId", id, "Error", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to mark notification as read");
        }
    }

    // Mark all notifications as read
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(
            @AuthenticationPrincipal com.engineerpro.example.redis.dto.UserPrincipal userPrincipal) {
        
        try {
            LoggingUtil.logBusinessEvent(logger, "Marking all notifications as read", 
                "Username", userPrincipal.getUsername());
            
            Profile profile = profileService.getUserProfile(userPrincipal);
            notificationRepository.markAllAsReadByRecipient(profile);
            
            LoggingUtil.logBusinessEvent(logger, "All notifications marked as read successfully", 
                "Username", userPrincipal.getUsername());
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to mark all notifications as read", 
                "Username", userPrincipal.getUsername(), "Error", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to mark all notifications as read");
        }
    }

    // Delete a notification
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(
            @AuthenticationPrincipal com.engineerpro.example.redis.dto.UserPrincipal userPrincipal,
            @PathVariable Long id) {
        
        try {
            LoggingUtil.logBusinessEvent(logger, "Deleting notification", 
                "Username", userPrincipal.getUsername(), "NotificationId", id);
            
            Profile profile = profileService.getUserProfile(userPrincipal);
            Notification notification = notificationRepository.findById(id)
                .orElse(null);
            
            if (notification == null) {
                LoggingUtil.logServiceWarning(logger, "Notification not found", 
                    "Username", userPrincipal.getUsername(), "NotificationId", id);
                return ResponseEntity.notFound().build();
            }
            
            if (notification.getRecipient().getId() != profile.getId()) {
                LoggingUtil.logServiceWarning(logger, "Unauthorized access to notification", 
                    "Username", userPrincipal.getUsername(), "NotificationId", id);
                return ResponseEntity.status(403).build();
            }
            
            notificationRepository.deleteById(id);
            
            LoggingUtil.logBusinessEvent(logger, "Notification deleted successfully", 
                "Username", userPrincipal.getUsername(), "NotificationId", id);
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to delete notification", 
                "Username", userPrincipal.getUsername(), "NotificationId", id, "Error", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to delete notification");
        }
    }

    // Delete all read notifications
    @DeleteMapping("/read")
    public ResponseEntity<?> deleteAllRead(
            @AuthenticationPrincipal com.engineerpro.example.redis.dto.UserPrincipal userPrincipal) {
        
        try {
            LoggingUtil.logBusinessEvent(logger, "Deleting all read notifications", 
                "Username", userPrincipal.getUsername());
            
            Profile profile = profileService.getUserProfile(userPrincipal);
            
            // Get all read notifications for the user
            List<Notification> readNotifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(profile)
                .stream()
                .filter(n -> n.getIsRead())
                .collect(Collectors.toList());
            
            // Delete them
            notificationRepository.deleteAll(readNotifications);
            
            LoggingUtil.logBusinessEvent(logger, "All read notifications deleted successfully", 
                "Username", userPrincipal.getUsername(), "DeletedCount", readNotifications.size());
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to delete read notifications", 
                "Username", userPrincipal.getUsername(), "Error", e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to delete read notifications");
        }
    }

    // Convert Notification entity to NotificationResponse DTO
    private NotificationResponse convertToResponse(Notification notification) {
        return NotificationResponse.builder()
            .id(notification.getId())
            .type(notification.getType().name())
            .message(notification.getMessage())
            .isRead(notification.getIsRead())
            .createdAt(notification.getCreatedAt())
            .senderId(notification.getSender() != null ? notification.getSender().getId() : null)
            .senderUsername(notification.getSender() != null ? notification.getSender().getUsername() : null)
            .senderProfileImageUrl(notification.getSender() != null ? notification.getSender().getProfileImageUrl() : null)
            .relatedPostId(notification.getRelatedPostId())
            .relatedCommentId(notification.getRelatedCommentId())
            .build();
    }

    // Response classes
    public static class NotificationListResponse {
        private List<NotificationResponse> notifications;
        private int totalCount;
        private int currentPage;
        private int pageSize;
        private boolean hasMore;

        public NotificationListResponse(List<NotificationResponse> notifications, int totalCount, int currentPage, int pageSize, boolean hasMore) {
            this.notifications = notifications;
            this.totalCount = totalCount;
            this.currentPage = currentPage;
            this.pageSize = pageSize;
            this.hasMore = hasMore;
        }

        // Getters
        public List<NotificationResponse> getNotifications() { return notifications; }
        public int getTotalCount() { return totalCount; }
        public int getCurrentPage() { return currentPage; }
        public int getPageSize() { return pageSize; }
        public boolean isHasMore() { return hasMore; }
    }

    public static class UnreadCountResponse {
        private long count;

        public UnreadCountResponse(long count) {
            this.count = count;
        }

        public long getCount() { return count; }
    }
}
