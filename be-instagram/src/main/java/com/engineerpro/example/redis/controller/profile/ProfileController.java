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

@RestController
@RequestMapping(path = "/profiles")
public class ProfileController {
  
  private static final Logger logger = LoggingUtil.getLogger(ProfileController.class);
  
  @Autowired
  ProfileService profileService;

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
      Profile profile = profileService.getUserProfile(id);
      GetProfileResponse response = GetProfileResponse.builder().profile(profile).build();
      
      LoggingUtil.logControllerExit(logger, "getProfile", response);
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "getProfile", e);
      throw e;
    }
  }

  @GetMapping("/me")
  public ResponseEntity<GetProfileResponse> getProfile(Authentication authentication) {
    LoggingUtil.logControllerEntry(logger, "getProfile", "authentication", authentication != null ? "present" : "null");
    
    try {
      UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
      Profile profile = profileService.getUserProfile(userPrincipal);
      GetProfileResponse response = GetProfileResponse.builder().profile(profile).build();
      
      LoggingUtil.logControllerExit(logger, "getProfile", response);
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "getProfile", e);
      throw e;
    }
  }
}
