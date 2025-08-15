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
import com.engineerpro.example.redis.service.profile.ProfileService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private FollowerRepository followerRepository;

    @Override
    public List<SuggestedUserResponse> getSuggestedUsers(UserPrincipal userPrincipal, int limit) {
        Profile currentProfile = profileService.getUserProfile(userPrincipal);
        
        // Get users that the current user already follows
        List<UserFollowing> followings = followerRepository.findByFollowerUserId(currentProfile.getId());
        List<Integer> followingIds = followings.stream()
            .map(UserFollowing::getFollowingUserId)
            .collect(Collectors.toList());
        
        // Add current user's ID to exclude them from suggestions
        followingIds.add(currentProfile.getId());
        
        log.info("Current user ID: {}, Following IDs: {}, Excluded IDs: {}", 
                currentProfile.getId(), 
                followings.stream().map(UserFollowing::getFollowingUserId).collect(Collectors.toList()),
                followingIds);
        
        // Get profiles that the current user doesn't follow
        List<Profile> suggestedProfiles = profileRepository.findByIdNotIn(followingIds);
        
        log.info("Found {} total profiles, {} available for suggestions", 
                profileRepository.count(), suggestedProfiles.size());
        
        // Convert to DTOs and limit results
        List<SuggestedUserResponse> suggestedUsers = suggestedProfiles.stream()
            .limit(limit)
            .map(this::convertToSuggestedUserResponse)
            .collect(Collectors.toList());
        
        log.info("Returning {} suggested users", suggestedUsers.size());
        
        return suggestedUsers;
    }
    
    private SuggestedUserResponse convertToSuggestedUserResponse(Profile profile) {
        // Get follower count for this profile
        int followersCount = followerRepository.countByFollowingUserId(profile.getId());
        
        return SuggestedUserResponse.builder()
            .id(profile.getId()) // Profile ID for follow/unfollow operations
            .uid(profile.getUserId()) // Use userId as uid for frontend compatibility
            .username(profile.getUsername())
            .profilePicURL(profile.getProfileImageUrl()) // Map from profileImageUrl
            .fullName(profile.getDisplayName()) // Map from displayName
            .bio(profile.getBio())
            .followersCount(followersCount)
            .build();
    }
}
