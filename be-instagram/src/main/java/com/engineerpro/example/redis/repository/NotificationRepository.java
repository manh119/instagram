package com.engineerpro.example.redis.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.engineerpro.example.redis.model.Notification;
import com.engineerpro.example.redis.model.Profile;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Find notifications for a specific recipient
    List<Notification> findByRecipientOrderByCreatedAtDesc(Profile recipient);
    
    // Find unread notifications for a specific recipient
    List<Notification> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(Profile recipient);
    
    // Count unread notifications for a specific recipient
    long countByRecipientAndIsReadFalse(Profile recipient);
    
    // Find notifications by type and recipient
    List<Notification> findByTypeAndRecipientOrderByCreatedAtDesc(String type, Profile recipient);
    
    // Find notifications by sender and recipient (for follow/unfollow)
    List<Notification> findBySenderAndRecipientAndTypeOrderByCreatedAtDesc(Profile sender, Profile recipient, String type);
    
    // Mark notifications as read
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient = :recipient")
    void markAllAsReadByRecipient(@Param("recipient") Profile recipient);
    
    // Mark specific notification as read
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id")
    void markAsReadById(@Param("id") Long id);
    
    // Delete old notifications (older than 30 days)
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    void deleteOldNotifications(@Param("cutoffDate") java.time.LocalDateTime cutoffDate);
}
