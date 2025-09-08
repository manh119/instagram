package com.engineerpro.example.redis.service.profile;

import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.engineerpro.example.redis.dto.UserPrincipal;
import com.engineerpro.example.redis.dto.profile.UpdateProfileImageRequest;
import com.engineerpro.example.redis.dto.profile.UpdateProfileRequest;
import com.engineerpro.example.redis.dto.profile.GetProfileResponse;
import com.engineerpro.example.redis.exception.UserNotFoundException;
import com.engineerpro.example.redis.model.Profile;
import com.engineerpro.example.redis.model.User;
import com.engineerpro.example.redis.repository.ProfileRepository;
import com.engineerpro.example.redis.repository.FollowerRepository;
import com.engineerpro.example.redis.repository.PostRepository;
import com.engineerpro.example.redis.repository.UserRepository;
import com.engineerpro.example.redis.service.UploadService;

@Service
public class ProfileServiceImpl implements ProfileService {
  @Autowired
  private UploadService uploadService;
  @Autowired
  private ProfileRepository profileRepository;
  @Autowired
  private FollowerRepository followerRepository;
  @Autowired
  private PostRepository postRepository;

  @Autowired
  private UserRepository userRepository;

  @Override
  public Profile getUserProfile(UserPrincipal userPrincipal) {
    User user = userRepository.findById(userPrincipal.getId()).orElseThrow(UserNotFoundException::new);
    
    // Get all profiles for this user (handles duplicates)
    List<Profile> profiles = profileRepository.findByUser(user);
    
    Profile profile;
    if (profiles.isEmpty()) {
      // No profile found, create a new one
      profile = Profile.builder()
        .user(user)
        .displayName(userPrincipal.getName())
        .username(userPrincipal.getUsername())
        .build();
      profileRepository.save(profile);
    } else if (profiles.size() == 1) {
      // Single profile found, use it
      profile = profiles.get(0);
    } else {
      // Multiple profiles found, use the first one (oldest by ID)
      // TODO: Consider cleaning up duplicate profiles in the future
      profile = profiles.get(0);
    }
    
    return profile;
  }

  @Override
  public Profile getUserProfile(int id) {
    return profileRepository.findById(id).orElseThrow(UserNotFoundException::new);
  }

  @Override
  public GetProfileResponse getUserProfileWithCounts(int id) {
    Profile profile = getUserProfile(id);
    
    // Get follower count for this profile
    int followersCount = followerRepository.countByFollowingUserId(profile.getId());
    
    // Get following count for this profile
    int followingCount = followerRepository.countByFollowerUserId(profile.getId());
    
    // Get posts count for this profile
    int postsCount = postRepository.countByCreatedBy(profile);
    
    return GetProfileResponse.builder()
        .profile(profile)
        .followersCount(followersCount)
        .followingCount(followingCount)
        .postsCount(postsCount)
        .build();
  }

  @Override
  public Profile updateProfile(UserPrincipal userPrincipal, UpdateProfileRequest request) {
    Profile profile = this.getUserProfile(userPrincipal);
    profile.setBio(request.getBio());
    profile.setDisplayName(request.getDisplayName());
    profile.setUsername(request.getUsername());
    profileRepository.save(profile);
    return profile;
  }

  @Override
  public Profile updateProfileImage(UserPrincipal userPrincipal, UpdateProfileImageRequest request) {
    String url = uploadService.uploadImage(request.getBase64ImageString());
    Profile profile = this.getUserProfile(userPrincipal);
    profile.setProfileImageUrl(url);
    profileRepository.save(profile);
    return profile;
  }

  @Override
  public GetProfileResponse getUserProfileByUsername(String username) {
    Profile profile = profileRepository.findOneByUsername(username)
        .orElseThrow(UserNotFoundException::new);
    
    // Get follower count for this profile
    int followersCount = followerRepository.countByFollowingUserId(profile.getId());
    
    // Get following count for this profile
    int followingCount = followerRepository.countByFollowerUserId(profile.getId());
    
    // Get posts count for this profile
    int postsCount = postRepository.countByCreatedBy(profile);
    
    return GetProfileResponse.builder()
        .profile(profile)
        .followersCount(followersCount)
        .followingCount(followingCount)
        .postsCount(postsCount)
        .build();
  }
}