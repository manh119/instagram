package com.engineerpro.example.redis.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class SuggestedUserResponse {
    private int id; // Profile ID for follow/unfollow operations
    private String uid; // Use userId as uid for frontend compatibility
    private String username;
    private String profilePicURL; // Map from profileImageUrl
    private String fullName; // Map from displayName
    private String bio;
    private int followersCount; // Number of followers
    private int followingCount; // Number of users this profile follows
    private int postsCount; // Number of posts by this profile
}
