package com.engineerpro.example.redis.service.feed;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.engineerpro.example.redis.dto.UserPrincipal;
import com.engineerpro.example.redis.dto.feed.GetFeedResponse;
import com.engineerpro.example.redis.model.Post;
import com.engineerpro.example.redis.model.Profile;
import com.engineerpro.example.redis.model.UserFollowing;
import com.engineerpro.example.redis.repository.FollowerRepository;
import com.engineerpro.example.redis.repository.PostRepository;
import com.engineerpro.example.redis.service.profile.ProfileService;
import com.engineerpro.example.redis.util.LoggingUtil;

import org.slf4j.Logger;

@Service("dynamicFeedService")
public class DynamicFeedServiceImpl implements FeedService {
  
  private static final Logger logger = LoggingUtil.getLogger(DynamicFeedServiceImpl.class);
  
  @Autowired
  private ProfileService profileService;

  @Autowired
  private PostRepository postRepository;

  @Autowired
  private FollowerRepository followerRepository;

  @Override
  public GetFeedResponse getFeed(UserPrincipal userPrincipal, int limit, int page) {
    LoggingUtil.logBusinessEvent(logger, "Getting dynamic feed", "username", userPrincipal.getUsername(), "limit", limit, "page", page);
    
    try {
      Profile profile = profileService.getUserProfile(userPrincipal);
      LoggingUtil.logServiceDebug(logger, "Profile retrieved for dynamic feed", "profileId", profile.getId());

      // Get users that the current user follows
      List<UserFollowing> followings = followerRepository.findByFollowerUserId(profile.getId());
      List<Integer> followingProfileIdList = followings.stream().map(following -> following.getFollowingUserId())
          .toList();
      
      // Include current user's own posts in the feed
      List<Integer> allProfileIds = new java.util.ArrayList<>(followingProfileIdList);
      allProfileIds.add(profile.getId());
      
      LoggingUtil.logServiceDebug(logger, "Dynamic feed profile IDs", "currentUserId", profile.getId(), "followingCount", followingProfileIdList.size(), "totalProfiles", allProfileIds.size());
      
      // If user doesn't follow anyone yet, just show their own posts
      if (followingProfileIdList.isEmpty()) {
        LoggingUtil.logServiceDebug(logger, "User doesn't follow anyone, showing only own posts", "username", userPrincipal.getUsername());
        
        int totalPost = postRepository.countByCreatedBy(profile);
        int totalPage = (int) Math.ceil((double) totalPost / limit);
        
        int adjustedPage = Math.max(0, page);
        int offset = adjustedPage * limit;
        
        // Use the method that eagerly loads profile data
        List<Post> posts = postRepository.findByCreatedByIdWithProfile(profile.getId());
        // Apply pagination manually since findByCreatedByIdWithProfile doesn't support pagination
        int startIndex = Math.min(offset, posts.size());
        int endIndex = Math.min(startIndex + limit, posts.size());
        List<Post> paginatedPosts = posts.subList(startIndex, endIndex);
        
        LoggingUtil.logServiceDebug(logger, "Own posts pagination", "totalPost", totalPost, "currentPageSize", paginatedPosts.size());
        
        GetFeedResponse response = GetFeedResponse.builder()
            .posts(paginatedPosts).totalPage(totalPage).build();
        
        LoggingUtil.logBusinessEvent(logger, "Dynamic feed (own posts only) retrieved successfully", "username", userPrincipal.getUsername(), "postsCount", paginatedPosts.size(), "totalPage", totalPage);
        
        return response;
      }
      
      int totalPost = postRepository.countByCreatedByIn(allProfileIds);
      int totalPage = (int) Math.ceil((double) totalPost / limit);
      
      // Handle pagination - ensure page is 0-based and offset is valid
      int adjustedPage = Math.max(0, page); // Ensure page is not negative
      int offset = adjustedPage * limit; // page 0 = offset 0, page 1 = offset limit, etc.
      
      LoggingUtil.logServiceDebug(logger, "Dynamic feed pagination", "page", page, "adjustedPage", adjustedPage, "limit", limit, "offset", offset, "totalPage", totalPage);

      // Use the new method that eagerly loads profile data
      List<Post> posts = postRepository.findByCreatedByProfileIdsWithProfile(allProfileIds);
      
      // Apply pagination manually since the new method doesn't support pagination
      int startIndex = Math.min(offset, posts.size());
      int endIndex = Math.min(startIndex + limit, posts.size());
      List<Post> paginatedPosts = posts.subList(startIndex, endIndex);

      LoggingUtil.logServiceDebug(logger, "Posts retrieved for dynamic feed", "postsCount", paginatedPosts.size(), "page", page, "limit", limit, "offset", offset);

      GetFeedResponse response = GetFeedResponse.builder()
          .posts(paginatedPosts).totalPage(totalPage).build();
      
      LoggingUtil.logBusinessEvent(logger, "Dynamic feed retrieved successfully", "username", userPrincipal.getUsername(), "postsCount", paginatedPosts.size(), "totalPage", totalPage, "followingCount", followingProfileIdList.size());
      
      return response;
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to get dynamic feed", "username", userPrincipal.getUsername(), "Error", e.getMessage());
      throw e;
    }
  }
}
