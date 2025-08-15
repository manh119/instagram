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

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("dynamicFeedService")
public class DynamicFeedServiceImpl implements FeedService {
  @Autowired
  private ProfileService profileService;

  @Autowired
  private PostRepository postRepository;

  @Autowired
  private FollowerRepository followerRepository;

  @Override
  public GetFeedResponse getFeed(UserPrincipal userPrincipal, int limit, int page) {
    Profile profile = profileService.getUserProfile(userPrincipal);

    // Get users that the current user follows
    List<UserFollowing> followings = followerRepository.findByFollowerUserId(profile.getId());
    List<Integer> followingProfileIdList = followings.stream().map(following -> following.getFollowingUserId())
        .toList();
    
    // Include current user's own posts in the feed
    List<Integer> allProfileIds = new java.util.ArrayList<>(followingProfileIdList);
    allProfileIds.add(profile.getId());
    
    log.info("Current user profile ID: {}", profile.getId());
    log.info("Following profile IDs: {}", followingProfileIdList);
    log.info("All profile IDs (including current user): {}", allProfileIds);
    
    // If user doesn't follow anyone yet, just show their own posts
    if (followingProfileIdList.isEmpty()) {
      log.info("User doesn't follow anyone yet, showing only their own posts");
      int totalPost = postRepository.countByCreatedBy(profile);
      int totalPage = (int) Math.ceil((double) totalPost / limit);
      
      int adjustedPage = Math.max(0, page);
      int offset = adjustedPage * limit;
      
      List<Post> posts = postRepository.findByCreatedBy(profile);
      // Apply pagination manually since findByCreatedBy(Profile) doesn't support pagination
      int startIndex = Math.min(offset, posts.size());
      int endIndex = Math.min(startIndex + limit, posts.size());
      List<Post> paginatedPosts = posts.subList(startIndex, endIndex);
      
      log.info("Showing only user's posts: {} total, {} in current page", totalPost, paginatedPosts.size());
      
      return GetFeedResponse.builder()
          .posts(paginatedPosts).totalPage(totalPage).build();
    }
    
    int totalPost = postRepository.countByCreatedByIn(allProfileIds);
    log.info("Total posts from followed users + current user: {}", totalPost);
    
    int totalPage = (int) Math.ceil((double) totalPost / limit);
    
    // Handle pagination - ensure page is 0-based and offset is valid
    int adjustedPage = Math.max(0, page); // Ensure page is not negative
    int offset = adjustedPage * limit; // page 0 = offset 0, page 1 = offset limit, etc.
    
    log.info("Pagination: page={}, adjustedPage={}, limit={}, offset={}, totalPage={}", 
             page, adjustedPage, limit, offset, totalPage);

    List<Post> posts = postRepository
        .findByCreatedBy(allProfileIds, limit, offset);

    log.info("Retrieved {} posts for page {} (limit: {}, offset: {})", posts.size(), page, limit, offset);

    return GetFeedResponse.builder()
        .posts(posts).totalPage(totalPage).build();
  }

}
