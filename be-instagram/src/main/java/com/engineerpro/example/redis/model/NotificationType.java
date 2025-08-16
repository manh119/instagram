package com.engineerpro.example.redis.model;

public enum NotificationType {
    FOLLOW,           // Someone followed you
    UNFOLLOW,         // Someone unfollowed you
    LIKE,             // Someone liked your post
    COMMENT,          // Someone commented on your post
    LIKE_COMMENT,     // Someone liked your comment
    MENTION,          // Someone mentioned you in a comment
    NEW_POST          // Someone you follow posted something new
}
