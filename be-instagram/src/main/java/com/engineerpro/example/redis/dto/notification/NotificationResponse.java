package com.engineerpro.example.redis.dto.notification;

import java.time.LocalDateTime;

import com.engineerpro.example.redis.model.NotificationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String type;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
    
    // Sender information
    private Integer senderId;
    private String senderUsername;
    private String senderProfileImageUrl;
    
    // Related content information
    private Integer relatedPostId;
    private Integer relatedCommentId;
    
    // Helper method to check if notification is unread
    public boolean isUnread() {
        return !isRead;
    }
}
