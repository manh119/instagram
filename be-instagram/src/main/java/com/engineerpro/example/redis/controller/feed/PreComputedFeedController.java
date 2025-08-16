package com.engineerpro.example.redis.controller.feed;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.engineerpro.example.redis.dto.UserPrincipal;
import com.engineerpro.example.redis.dto.feed.GetFeedResponse;
import com.engineerpro.example.redis.service.feed.FeedService;
import com.engineerpro.example.redis.util.LoggingUtil;

import org.slf4j.Logger;

@RestController
@RequestMapping(path = "/precomputed-feeds")
public class PreComputedFeedController {
  
  private static final Logger logger = LoggingUtil.getLogger(PreComputedFeedController.class);
  
  private FeedService feedService;

  public PreComputedFeedController(@Qualifier("precomputedFeedService") FeedService feedService) {
    this.feedService = feedService;
  }

  @GetMapping()
  public ResponseEntity<GetFeedResponse> getFeed(@RequestParam("page") int page,
      @RequestParam("limit") int limit, Authentication authentication) {
    
    LoggingUtil.logControllerEntry(logger, "getFeed", "page", page, "limit", limit, "authentication", authentication != null ? "present" : "null");
    
    try {
      UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
      GetFeedResponse response = feedService.getFeed(userPrincipal, limit, page);
      
      LoggingUtil.logControllerExit(logger, "getFeed", "Feed retrieved successfully");
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "getFeed", e);
      throw e;
    }
  }
}
