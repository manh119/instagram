package com.engineerpro.example.redis.controller.profile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.engineerpro.example.redis.dto.UserPrincipal;
import com.engineerpro.example.redis.dto.profile.GetProfileResponse;
import com.engineerpro.example.redis.dto.profile.UpdateProfileImageRequest;
import com.engineerpro.example.redis.dto.profile.UpdateProfileImageResponse;
import com.engineerpro.example.redis.dto.profile.UpdateProfileRequest;
import com.engineerpro.example.redis.dto.profile.UpdateProfileResponse;
import com.engineerpro.example.redis.model.Profile;
import com.engineerpro.example.redis.service.profile.ProfileService;
import com.engineerpro.example.redis.util.LoggingUtil;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import com.engineerpro.example.redis.repository.FollowerRepository;
import com.engineerpro.example.redis.repository.PostRepository;

@RestController
@RequestMapping(path = "/profiles")
public class ProfileController {
  
  private static final Logger logger = LoggingUtil.getLogger(ProfileController.class);
  
  @Autowired
  ProfileService profileService;

  @Autowired
  private FollowerRepository followerRepository;

  @Autowired
  private PostRepository postRepository;

  @PostMapping("/profile-image")
  public ResponseEntity<UpdateProfileImageResponse> updateProfileImage(
      @Valid @RequestBody UpdateProfileImageRequest request, Authentication authentication) {
    
    LoggingUtil.logControllerEntry(logger, "updateProfileImage", "request", request, "authentication", authentication != null ? "present" : "null");
    
    try {
      UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
      Profile profile = profileService.updateProfileImage(userPrincipal, request);
      UpdateProfileImageResponse response = UpdateProfileImageResponse.builder().url(profile.getProfileImageUrl()).build();
      
      LoggingUtil.logControllerExit(logger, "updateProfileImage", response);
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "updateProfileImage", e);
      throw e;
    }
  }

  @PostMapping()
  public ResponseEntity<UpdateProfileResponse> updateProfile(
      @Valid @RequestBody UpdateProfileRequest request, Authentication authentication) {
    
    LoggingUtil.logControllerEntry(logger, "updateProfile", "request", request, "authentication", authentication != null ? "present" : "null");
    
    try {
      UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
      Profile profile = profileService.updateProfile(userPrincipal, request);
      UpdateProfileResponse response = UpdateProfileResponse.builder().profile(profile).build();
      
      LoggingUtil.logControllerExit(logger, "updateProfile", response);
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "updateProfile", e);
      throw e;
    }
  }

  @GetMapping("/{id}")
  public ResponseEntity<GetProfileResponse> getProfile(@PathVariable int id) {
    LoggingUtil.logControllerEntry(logger, "getProfile", "profileId", id);
    
    try {
      GetProfileResponse response = profileService.getUserProfileWithCounts(id);
      
      LoggingUtil.logControllerExit(logger, "getProfile", response);
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "getProfile", e);
      throw e;
    }
  }

  @GetMapping("/username/{username}")
  public ResponseEntity<GetProfileResponse> getProfileByUsername(@PathVariable String username) {
    LoggingUtil.logControllerEntry(logger, "getProfileByUsername", "username", username);
    
    try {
      GetProfileResponse response = profileService.getUserProfileByUsername(username);
      
      LoggingUtil.logControllerExit(logger, "getProfileByUsername", response);
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "getProfileByUsername", e);
      throw e;
    }
  }

  @GetMapping("/me")
  public ResponseEntity<GetProfileResponse> getProfile(Authentication authentication) {
    LoggingUtil.logControllerEntry(logger, "getProfile", "authentication", authentication != null ? "present" : "null");
    
    try {
      UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
      Profile profile = profileService.getUserProfile(userPrincipal);
      
      // Get counts for current user profile
      int followersCount = followerRepository.countByFollowingUserId(profile.getId());
      int followingCount = followerRepository.countByFollowerUserId(profile.getId());
      int postsCount = postRepository.countByCreatedBy(profile);
      
      GetProfileResponse response = GetProfileResponse.builder()
          .profile(profile)
          .followersCount(followersCount)
          .followingCount(followingCount)
          .postsCount(postsCount)
          .build();
      
      LoggingUtil.logControllerExit(logger, "getProfile", response);
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "getProfile", e);
      throw e;
    }
  }
}
