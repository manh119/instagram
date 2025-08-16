package com.engineerpro.example.redis.controller.profile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.engineerpro.example.redis.dto.UserPrincipal;
import com.engineerpro.example.redis.dto.profile.FollowUserRequest;
import com.engineerpro.example.redis.dto.profile.FollowUserResponse;
import com.engineerpro.example.redis.dto.profile.GetFollowerResponse;
import com.engineerpro.example.redis.dto.profile.GetFollowingResponse;
import com.engineerpro.example.redis.dto.profile.UnFollowUserResponse;
import com.engineerpro.example.redis.dto.profile.UnfollowUserRequest;
import com.engineerpro.example.redis.service.profile.FollowerService;
import com.engineerpro.example.redis.util.LoggingUtil;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import org.slf4j.Logger;

@RestController
@RequestMapping(path = "/follow")
@Validated
public class FollowerController {
  
  private static final Logger logger = LoggingUtil.getLogger(FollowerController.class);
  
  @Autowired
  FollowerService followerService;

  @GetMapping("/user/followers/{id}")
  public ResponseEntity<GetFollowerResponse> getFollowers(@PathVariable int id,
      @RequestParam("page") @Min(1) Integer page,
      @RequestParam("limit") @Min(1) int limit) {
    
    LoggingUtil.logControllerEntry(logger, "getFollowers", "userId", id, "page", page, "limit", limit);
    
    try {
      GetFollowerResponse response = followerService.getFollowers(id, page, limit);
      LoggingUtil.logControllerExit(logger, "getFollowers", "Followers retrieved successfully");
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "getFollowers", e);
      throw e;
    }
  }

  @GetMapping("/user/followings/{id}")
  public ResponseEntity<GetFollowingResponse> getFollowing(@PathVariable int id, @RequestParam("page") @Min(1) int page,
      @RequestParam("limit") @Min(1) int limit) {
    
    LoggingUtil.logControllerEntry(logger, "getFollowing", "userId", id, "page", page, "limit", limit);
    
    try {
      GetFollowingResponse response = followerService.getFollowings(id, page, limit);
      LoggingUtil.logControllerExit(logger, "getFollowing", "Followings retrieved successfully");
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "getFollowing", e);
      throw e;
    }
  }

  @PostMapping()
  public ResponseEntity<FollowUserResponse> folowUser(
      @Valid @RequestBody FollowUserRequest request, Authentication authentication) {
    
    LoggingUtil.logControllerEntry(logger, "followUser", "request", request, "authentication", authentication != null ? "present" : "null");
    
    try {
      UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
      followerService.folowUser(userPrincipal, request.getProfileId());
      
      LoggingUtil.logControllerExit(logger, "followUser", "User followed successfully");
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "followUser", e);
      throw e;
    }
  }

  @DeleteMapping()
  public ResponseEntity<UnFollowUserResponse> unfolowUser(
      @Valid @RequestBody UnfollowUserRequest request, Authentication authentication) {
    
    LoggingUtil.logControllerEntry(logger, "unfollowUser", "request", request, "authentication", authentication != null ? "present" : "null");
    
    try {
      UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
      followerService.unfolowUser(userPrincipal, request.getProfileId());
      
      LoggingUtil.logControllerExit(logger, "unfollowUser", "User unfollowed successfully");
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "unfollowUser", e);
      throw e;
    }
  }
}
