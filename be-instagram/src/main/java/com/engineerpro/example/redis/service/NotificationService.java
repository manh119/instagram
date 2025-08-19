package com.engineerpro.example.redis.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.engineerpro.example.redis.model.Comment;
import com.engineerpro.example.redis.model.Notification;
import com.engineerpro.example.redis.model.NotificationType;
import com.engineerpro.example.redis.model.Post;
import com.engineerpro.example.redis.model.Profile;
import com.engineerpro.example.redis.model.UserFollowing;
import com.engineerpro.example.redis.repository.NotificationRepository;
import com.engineerpro.example.redis.repository.FollowerRepository;
import com.engineerpro.example.redis.util.LoggingUtil;

import org.slf4j.Logger;

@Service
public class NotificationService {

    private static final Logger logger = LoggingUtil.getLogger(NotificationService.class);
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private FollowerRepository followerRepository;

    // Create follow notification
    public void createFollowNotification(Profile follower, Profile following) {
        try {
            // Don't create notification if user is following themselves
            if (follower.getId() == following.getId()) {
                return;
            }

            Notification notification = Notification.builder()
                .recipient(following)
                .sender(follower)
                .type(NotificationType.FOLLOW)
                .message(follower.getUsername() + " started following you")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

            notificationRepository.save(notification);
            
            LoggingUtil.logBusinessEvent(logger, "Follow notification created", 
                "Follower", follower.getUsername(), 
                "Following", following.getUsername());
                
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to create follow notification", 
                "Follower", follower.getUsername(), 
                "Following", following.getUsername(), 
                "Error", e.getMessage());
        }
    }

    // Create unfollow notification
    public void createUnfollowNotification(Profile follower, Profile following) {
        try {
            // Don't create notification if user is unfollowing themselves
            if (follower.getId() == following.getId()) {
                return;
            }

            Notification notification = Notification.builder()
                .recipient(following)
                .sender(follower)
                .type(NotificationType.UNFOLLOW)
                .message(follower.getUsername() + " unfollowed you")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

            notificationRepository.save(notification);
            
            LoggingUtil.logBusinessEvent(logger, "Unfollow notification created", 
                "Follower", follower.getUsername(), 
                "Following", following.getUsername());
                
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to create unfollow notification", 
                "Follower", follower.getUsername(), 
                "Following", following.getUsername(), 
                "Error", e.getMessage());
        }
    }

    // Create like notification
    public void createLikeNotification(Profile liker, Post post) {
        try {
            // Don't create notification if user likes their own post
            if (liker.getId() == post.getCreatedBy().getId()) {
                return;
            }

            Notification notification = Notification.builder()
                .recipient(post.getCreatedBy())
                .sender(liker)
                .type(NotificationType.LIKE)
                .message(liker.getUsername() + " liked your post")
                .relatedPostId(post.getId())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

            notificationRepository.save(notification);
            
            LoggingUtil.logBusinessEvent(logger, "Like notification created", 
                "Liker", liker.getUsername(), 
                "PostCreator", post.getCreatedBy().getUsername(),
                "PostId", post.getId());
                
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to create like notification", 
                "Liker", liker.getUsername(), 
                "PostId", post.getId(), 
                "Error", e.getMessage());
        }
    }

    // Create comment notification
    public void createCommentNotification(Profile commenter, Comment comment, Post post) {
        try {
            // Don't create notification if user comments on their own post
            if (commenter.getId() == post.getCreatedBy().getId()) {
                return;
            }

            Notification notification = Notification.builder()
                .recipient(post.getCreatedBy())
                .sender(commenter)
                .type(NotificationType.COMMENT)
                .message(commenter.getUsername() + " commented: " + 
                    (comment.getContent().length() > 50 ? 
                        comment.getContent().substring(0, 50) + "..." : 
                        comment.getContent()))
                .relatedPostId(post.getId())
                .relatedCommentId(comment.getId())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

            notificationRepository.save(notification);
            
            LoggingUtil.logBusinessEvent(logger, "Comment notification created", 
                "Commenter", commenter.getUsername(), 
                "PostCreator", post.getCreatedBy().getUsername(),
                "PostId", post.getId(),
                "CommentId", comment.getId());
                
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to create comment notification", 
                "Commenter", commenter.getUsername(), 
                "PostId", post.getId(), 
                "Error", e.getMessage());
        }
    }

    // Create like comment notification
    public void createLikeCommentNotification(Profile liker, Comment comment) {
        try {
            // Don't create notification if user likes their own comment
            if (liker.getId() == comment.getCreatedBy().getId()) {
                return;
            }

            Notification notification = Notification.builder()
                .recipient(comment.getCreatedBy())
                .sender(liker)
                .type(NotificationType.LIKE_COMMENT)
                .message(liker.getUsername() + " liked your comment")
                .relatedPostId(comment.getPost().getId())
                .relatedCommentId(comment.getId())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

            notificationRepository.save(notification);
            
            LoggingUtil.logBusinessEvent(logger, "Like comment notification created", 
                "Liker", liker.getUsername(), 
                "CommentCreator", comment.getCreatedBy().getUsername(),
                "CommentId", comment.getId());
                
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to create like comment notification", 
                "Liker", liker.getUsername(), 
                "CommentId", comment.getId(), 
                "Error", e.getMessage());
        }
    }

    // Create mention notification
    public void createMentionNotification(Profile mentionedUser, Profile mentioner, Comment comment, Post post) {
        try {
            // Don't create notification if user mentions themselves
            if (mentionedUser.getId() == mentioner.getId()) {
                return;
            }

            Notification notification = Notification.builder()
                .recipient(mentionedUser)
                .sender(mentioner)
                .type(NotificationType.MENTION)
                .message(mentioner.getUsername() + " mentioned you in a comment")
                .relatedPostId(post.getId())
                .relatedCommentId(comment.getId())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

            notificationRepository.save(notification);
            
            LoggingUtil.logBusinessEvent(logger, "Mention notification created", 
                "Mentioner", mentioner.getUsername(), 
                "MentionedUser", mentionedUser.getUsername(),
                "PostId", post.getId(),
                "CommentId", comment.getId());
                
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to create mention notification", 
                "Mentioner", mentioner.getUsername(), 
                "MentionedUser", mentionedUser.getUsername(),
                "Error", e.getMessage());
        }
    }

    // Create new post notification for followers
    public void createNewPostNotification(Post post) {
        try {
            Profile postCreator = post.getCreatedBy();
            
            // Get all followers of the post creator
            List<UserFollowing> followers = followerRepository.findByFollowingUserId(postCreator.getId());
            
            for (UserFollowing follower : followers) {
                // Create notification for each follower
                Notification notification = Notification.builder()
                    .recipient(followerRepository.findById(follower.getFollowerUserId())
                        .map(f -> Profile.builder().id(f.getFollowerUserId()).build())
                        .orElse(null))
                    .sender(postCreator)
                    .type(NotificationType.NEW_POST)
                    .message(postCreator.getUsername() + " posted something new")
                    .relatedPostId(post.getId())
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build();

                notificationRepository.save(notification);
            }
            
            LoggingUtil.logBusinessEvent(logger, "New post notifications created", 
                "PostCreator", postCreator.getUsername(),
                "PostId", post.getId(),
                "FollowerCount", followers.size());
                
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to create new post notifications", 
                "PostId", post.getId(), 
                "Error", e.getMessage());
        }
    }

    // Delete notifications related to a post (when post is deleted)
    public void deletePostNotifications(Post post) {
        try {
            List<Notification> postNotifications = notificationRepository.findAll().stream()
                .filter(n -> post.getId() == n.getRelatedPostId())
                .toList();
            
            notificationRepository.deleteAll(postNotifications);
            
            LoggingUtil.logBusinessEvent(logger, "Post notifications deleted", 
                "PostId", post.getId(),
                "DeletedCount", postNotifications.size());
                
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to delete post notifications", 
                "PostId", post.getId(), 
                "Error", e.getMessage());
        }
    }

    // Delete notifications related to a comment (when comment is deleted)
    public void deleteCommentNotifications(Comment comment) {
        try {
            List<Notification> commentNotifications = notificationRepository.findAll().stream()
                .filter(n -> comment.getId() == n.getRelatedCommentId())
                .toList();
            
            notificationRepository.deleteAll(commentNotifications);
            
            LoggingUtil.logBusinessEvent(logger, "Comment notifications deleted", 
                "CommentId", comment.getId(),
                "DeletedCount", commentNotifications.size());
                
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to delete comment notifications", 
                "CommentId", comment.getId(), 
                "Error", e.getMessage());
        }
    }

    // Clean up old notifications (older than 30 days)
    public void cleanupOldNotifications() {
        try {
            LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
            notificationRepository.deleteOldNotifications(cutoffDate);
            
            LoggingUtil.logBusinessEvent(logger, "Old notifications cleaned up", 
                "CutoffDate", cutoffDate.toString());
                
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to cleanup old notifications", 
                "Error", e.getMessage());
        }
    }
}
