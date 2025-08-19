package com.engineerpro.example.redis.service.profile;

import java.util.Date;
import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.engineerpro.example.redis.dto.UserPrincipal;
import com.engineerpro.example.redis.dto.profile.GetFollowerResponse;
import com.engineerpro.example.redis.dto.profile.GetFollowingResponse;
import com.engineerpro.example.redis.exception.InvalidInputException;
import com.engineerpro.example.redis.model.Profile;
import com.engineerpro.example.redis.model.UserFollowing;
import com.engineerpro.example.redis.repository.FollowerRepository;
import com.engineerpro.example.redis.service.NotificationService;
import com.engineerpro.example.redis.util.LoggingUtil;

import org.slf4j.Logger;

@Service
public class FollowerServiceImpl implements FollowerService {
  
  private static final Logger logger = LoggingUtil.getLogger(FollowerServiceImpl.class);
  
  @Autowired
  private ProfileService profileService;
  @Autowired
  private FollowerRepository followerRepository;
  @Autowired
  private NotificationService notificationService;

  @Override
  public void folowUser(UserPrincipal userPrincipal, int profileId) {
    LoggingUtil.logBusinessEvent(logger, "Following user", "username", userPrincipal.getUsername(), "targetProfileId", profileId);
    
    try {
      Profile profile = profileService.getUserProfile(userPrincipal);
      LoggingUtil.logServiceDebug(logger, "Follower profile retrieved", "followerProfileId", profile.getId());
      
      if (profile.getId() == profileId) {
        LoggingUtil.logServiceWarning(logger, "User trying to follow themselves", "username", userPrincipal.getUsername(), "profileId", profileId);
        throw new InvalidInputException();
      }
      
      UserFollowing existedUserFollowing = followerRepository.findByFollowerUserIdAndFollowingUserId(profile.getId(), profileId);
      if (Objects.nonNull(existedUserFollowing)) {
        LoggingUtil.logServiceDebug(logger, "User already following target", "username", userPrincipal.getUsername(), "targetProfileId", profileId);
        return;
      }

      UserFollowing userFollowing = new UserFollowing();
      userFollowing.setFollowerUserId(profile.getId());
      userFollowing.setFollowingUserId(profileId);
      userFollowing.setCreatedAt(new Date());
      
      followerRepository.save(userFollowing);
      
      // Create follow notification
      Profile targetProfile = profileService.getUserProfile(profileId);
      notificationService.createFollowNotification(profile, targetProfile);
      
      LoggingUtil.logBusinessEvent(logger, "User followed successfully", "username", userPrincipal.getUsername(), "targetProfileId", profileId);
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to follow user", "username", userPrincipal.getUsername(), "targetProfileId", profileId, "Error", e.getMessage());
      throw e;
    }
  }

  @Override
  public void unfolowUser(UserPrincipal userPrincipal, int profileId) {
    LoggingUtil.logBusinessEvent(logger, "Unfollowing user", "username", userPrincipal.getUsername(), "targetProfileId", profileId);
    
    try {
      Profile profile = profileService.getUserProfile(userPrincipal);
      LoggingUtil.logServiceDebug(logger, "Follower profile retrieved", "followerProfileId", profile.getId());
      
      UserFollowing existedUserFollowing = followerRepository.findByFollowerUserIdAndFollowingUserId(profile.getId(), profileId);
      if (Objects.isNull(existedUserFollowing)) {
        LoggingUtil.logServiceDebug(logger, "User not following target", "username", userPrincipal.getUsername(), "targetProfileId", profileId);
        return;
      }
      
      followerRepository.delete(existedUserFollowing);
      
      // Create unfollow notification
      Profile targetProfile = profileService.getUserProfile(profileId);
      notificationService.createUnfollowNotification(profile, targetProfile);
      
      LoggingUtil.logBusinessEvent(logger, "User unfollowed successfully", "username", userPrincipal.getUsername(), "targetProfileId", profileId);
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to unfollow user", "username", userPrincipal.getUsername(), "targetProfileId", profileId, "Error", e.getMessage());
      throw e;
    }
  }

  @Override
  public GetFollowerResponse getFollowers(int profileId, int page, int limit) {
    LoggingUtil.logBusinessEvent(logger, "Getting followers", "profileId", profileId, "page", page, "limit", limit);
    
    try {
      profileService.getUserProfile(profileId);
      int totalFollower = followerRepository.countByFollowingUserId(profileId);
      int totalPage = (int) Math.ceil((double) totalFollower / limit);
      int offset = (page - 1) * limit;
      
      LoggingUtil.logServiceDebug(logger, "Followers pagination", "totalFollower", totalFollower, "totalPage", totalPage, "offset", offset);
      
      List<Profile> followerProfiles = followerRepository.findByFollowingUserId(profileId, limit, offset).stream()
          .map(userFollowing -> profileService.getUserProfile(userFollowing.getFollowerUserId())).toList();

      GetFollowerResponse response = GetFollowerResponse.builder()
          .totalPage(totalPage)
          .followers(followerProfiles)
          .build();
      
      LoggingUtil.logBusinessEvent(logger, "Followers retrieved successfully", "profileId", profileId, "followersCount", followerProfiles.size(), "totalPage", totalPage);
      
      return response;
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to get followers", "profileId", profileId, "Error", e.getMessage());
      throw e;
    }
  }

  @Override
  public GetFollowingResponse getFollowings(int profileId, int page, int limit) {
    LoggingUtil.logBusinessEvent(logger, "Getting followings", "profileId", profileId, "page", page, "limit", limit);
    
    try {
      profileService.getUserProfile(profileId);
      int totalFollowing = followerRepository.countByFollowerUserId(profileId);
      int totalPage = (int) Math.ceil((double) totalFollowing / limit);
      int offset = (page - 1) * limit;
      
      LoggingUtil.logServiceDebug(logger, "Followings pagination", "totalFollowing", totalFollowing, "totalPage", totalPage, "offset", offset);
      
      List<Profile> followingProfiles = followerRepository.findByFollowerUserId(profileId, limit, offset).stream()
          .map(userFollowing -> profileService.getUserProfile(userFollowing.getFollowingUserId())).toList();

      GetFollowingResponse response = GetFollowingResponse.builder()
          .totalPage(totalPage)
          .followings(followingProfiles)
          .build();
      
      LoggingUtil.logBusinessEvent(logger, "Followings retrieved successfully", "profileId", profileId, "followingsCount", followingProfiles.size(), "totalPage", totalPage);
      
      return response;
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to get followings", "profileId", profileId, "Error", e.getMessage());
      throw e;
    }
  }
}