package com.engineerpro.example.redis.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.engineerpro.example.redis.dto.SuggestedUserResponse;
import com.engineerpro.example.redis.dto.UserPrincipal;
import com.engineerpro.example.redis.model.Profile;
import com.engineerpro.example.redis.model.UserFollowing;
import com.engineerpro.example.redis.repository.FollowerRepository;
import com.engineerpro.example.redis.repository.ProfileRepository;
import com.engineerpro.example.redis.repository.PostRepository;
import com.engineerpro.example.redis.service.profile.ProfileService;
import com.engineerpro.example.redis.util.LoggingUtil;

import org.slf4j.Logger;

@Service
public class UserServiceImpl implements UserService {

    private static final Logger logger = LoggingUtil.getLogger(UserServiceImpl.class);

    @Autowired
    private ProfileService profileService;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private FollowerRepository followerRepository;

    @Autowired
    private PostRepository postRepository;

    @Override
    public List<SuggestedUserResponse> getSuggestedUsers(UserPrincipal userPrincipal, int limit) {
        LoggingUtil.logBusinessEvent(logger, "Getting suggested users", "user", userPrincipal.getUsername(), "limit", limit);
        
        try {
            Profile currentProfile = profileService.getUserProfile(userPrincipal);
            LoggingUtil.logServiceDebug(logger, "Retrieved current user profile", "profileId", currentProfile.getId());
            
            // Get users that the current user already follows
            List<UserFollowing> followings = followerRepository.findByFollowerUserId(currentProfile.getId());
            List<Integer> followingIds = followings.stream()
                .map(UserFollowing::getFollowingUserId)
                .collect(Collectors.toList());
            
            // Add current user's ID to exclude them from suggestions
            followingIds.add(currentProfile.getId());
            
            LoggingUtil.logServiceDebug(logger, "Current user following analysis", 
                "currentUserId", currentProfile.getId(), 
                "followingCount", followings.size(),
                "excludedIds", followingIds);
            
            // Get profiles that the current user doesn't follow
            List<Profile> suggestedProfiles = profileRepository.findByIdNotIn(followingIds);
            
            LoggingUtil.logServiceDebug(logger, "Profile filtering results", 
                "totalProfiles", profileRepository.count(), 
                "availableProfiles", suggestedProfiles.size());
            
            // Convert to DTOs and limit results
            List<SuggestedUserResponse> suggestedUsers = suggestedProfiles.stream()
                .limit(limit)
                .map(this::convertToSuggestedUserResponse)
                .collect(Collectors.toList());
            
            LoggingUtil.logBusinessEvent(logger, "Suggested users retrieved successfully", 
                "count", suggestedUsers.size(), 
                "requestedLimit", limit);
            
            return suggestedUsers;
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Error getting suggested users", "error", e.getMessage());
            throw e;
        }
    }

    @Override
    public List<SuggestedUserResponse> searchUsers(UserPrincipal userPrincipal, String query, int limit) {
        LoggingUtil.logBusinessEvent(logger, "Searching users", "user", userPrincipal.getUsername(), "query", query, "limit", limit);
        
        try {
            Profile currentProfile = profileService.getUserProfile(userPrincipal);
            LoggingUtil.logServiceDebug(logger, "Retrieved current user profile for search", "profileId", currentProfile.getId());
            
            // Search profiles by username or display name (case-insensitive)
            List<Profile> searchResults = profileRepository.findByUsernameContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(query, query);
            
            LoggingUtil.logServiceDebug(logger, "Search query results", 
                "query", query, 
                "totalResults", searchResults.size());
            
            // Filter out current user and convert to DTOs
            List<SuggestedUserResponse> searchUsers = searchResults.stream()
                .filter(profile -> profile.getId() != currentProfile.getId()) // Exclude current user
                .limit(limit)
                .map(this::convertToSuggestedUserResponse)
                .collect(Collectors.toList());
            
            LoggingUtil.logBusinessEvent(logger, "User search completed successfully", 
                "query", query,
                "totalResults", searchResults.size(),
                "filteredResults", searchUsers.size(),
                "requestedLimit", limit);
            
            return searchUsers;
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Error searching users", "query", query, "error", e.getMessage());
            throw e;
        }
    }
    
    private SuggestedUserResponse convertToSuggestedUserResponse(Profile profile) {
        LoggingUtil.logServiceDebug(logger, "Converting profile to suggested user response", 
            "profileId", profile.getId(), "username", profile.getUsername());
        
        try {
            // Get follower count for this profile
            int followersCount = followerRepository.countByFollowingUserId(profile.getId());
            
            // Get following count for this profile
            int followingCount = followerRepository.countByFollowerUserId(profile.getId());
            
            // Get posts count for this profile
            int postsCount = postRepository.countByCreatedBy(profile);
            
            SuggestedUserResponse response = SuggestedUserResponse.builder()
                .id(profile.getId()) // Profile ID for follow/unfollow operations
                .uid(profile.getUserId()) // Use userId as uid for frontend compatibility
                .username(profile.getUsername())
                .profilePicURL(profile.getProfileImageUrl()) // Map from profileImageUrl
                .fullName(profile.getDisplayName()) // Map from displayName
                .bio(profile.getBio())
                .followersCount(followersCount)
                .followingCount(followingCount)
                .postsCount(postsCount)
                .build();
            
            LoggingUtil.logServiceDebug(logger, "Profile conversion completed", 
                "profileId", profile.getId(), 
                "followersCount", followersCount,
                "followingCount", followingCount,
                "postsCount", postsCount);
            
            return response;
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Error converting profile to suggested user", 
                "profileId", profile.getId(), "error", e.getMessage());
            throw e;
        }
    }
}
