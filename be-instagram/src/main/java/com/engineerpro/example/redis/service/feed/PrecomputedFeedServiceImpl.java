package com.engineerpro.example.redis.service.feed;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.engineerpro.example.redis.dto.UserPrincipal;
import com.engineerpro.example.redis.dto.feed.GetFeedResponse;
import com.engineerpro.example.redis.model.Post;
import com.engineerpro.example.redis.model.Profile;
import com.engineerpro.example.redis.repository.FeedRepository;
import com.engineerpro.example.redis.repository.PostRepository;
import com.engineerpro.example.redis.service.profile.ProfileService;
import com.engineerpro.example.redis.util.LoggingUtil;

import org.slf4j.Logger;

@Service("precomputedFeedService")
public class PrecomputedFeedServiceImpl implements FeedService {
  
  private static final Logger logger = LoggingUtil.getLogger(PrecomputedFeedServiceImpl.class);
  
  @Autowired
  private ProfileService profileService;

  @Autowired
  private PostRepository postRepository;

  @Autowired
  private FeedRepository feedRepository;

  @Override
  public GetFeedResponse getFeed(UserPrincipal userPrincipal, int limit, int page) {
    LoggingUtil.logBusinessEvent(logger, "Getting precomputed feed", "username", userPrincipal.getUsername(), "limit", limit, "page", page);
    
    try {
      Profile profile = profileService.getUserProfile(userPrincipal);
      LoggingUtil.logServiceDebug(logger, "Profile retrieved for feed", "profileId", profile.getId());

      List<Long> postIds = feedRepository.getFeed(profile.getId(), limit, page);
      LoggingUtil.logServiceDebug(logger, "Feed post IDs retrieved", "postIdsCount", postIds.size(), "postIds", postIds);

      List<Post> posts = postRepository.findAllById(postIds.stream().map(Long::intValue).toList());
      LoggingUtil.logServiceDebug(logger, "Posts retrieved from repository", "postsCount", posts.size());

      Long totalPost = feedRepository.getFeedSize(profile.getId());
      int totalPage = (int) Math.ceil((double) totalPost / limit);
      
      LoggingUtil.logServiceDebug(logger, "Feed pagination calculated", "totalPost", totalPost, "totalPage", totalPage);

      GetFeedResponse response = GetFeedResponse.builder()
          .posts(posts).totalPage(totalPage).build();
      
      LoggingUtil.logBusinessEvent(logger, "Precomputed feed retrieved successfully", "username", userPrincipal.getUsername(), "postsCount", posts.size(), "totalPage", totalPage);
      
      return response;
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to get precomputed feed", "username", userPrincipal.getUsername(), "Error", e.getMessage());
      throw e;
    }
  }
}
