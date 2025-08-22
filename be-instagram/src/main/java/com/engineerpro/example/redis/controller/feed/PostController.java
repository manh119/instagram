package com.engineerpro.example.redis.controller.feed;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.engineerpro.example.redis.dto.UserPrincipal;
import com.engineerpro.example.redis.dto.feed.CreatePostRequest;
import com.engineerpro.example.redis.dto.feed.CreatePostResponse;
import com.engineerpro.example.redis.dto.feed.DeletePostResponse;
import com.engineerpro.example.redis.dto.feed.GetPostResponse;
import com.engineerpro.example.redis.dto.feed.GetUserPostResponse;
import com.engineerpro.example.redis.dto.feed.PostUploadUrlRequest;
import com.engineerpro.example.redis.model.Post;
import com.engineerpro.example.redis.service.feed.PostService;
import com.engineerpro.example.redis.service.PreSignedUrlService;
import com.engineerpro.example.redis.util.LoggingUtil;

import jakarta.validation.Valid;
import org.slf4j.Logger;

@RestController
@RequestMapping(path = "/posts")
public class PostController {
  
  private static final Logger logger = LoggingUtil.getLogger(PostController.class);
  
  @Autowired
  private PostService postService;
  
  @Autowired
  private PreSignedUrlService preSignedUrlService;

  /**
   * Get pre-signed URL for post image upload
   */
  @PostMapping("/upload-url")
  public ResponseEntity<?> getPostUploadUrl(
      @RequestBody PostUploadUrlRequest request,
      Authentication authentication) {
    
    try {
      LoggingUtil.logControllerEntry(logger, "getPostUploadUrl", "request", request);
      
      UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
      
      // Validate request
      if (request.getFileName() == null || request.getFileName().trim().isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("error", "File name is required"));
      }
      
      if (request.getContentType() == null || request.getContentType().trim().isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("error", "Content type is required"));
      }
      
      // Generate pre-signed URL
      PreSignedUrlService.PreSignedUrlResponse response = 
        preSignedUrlService.generateImageUploadUrl(request.getFileName(), request.getContentType());
      
      LoggingUtil.logControllerExit(logger, "getPostUploadUrl", response);
      return ResponseEntity.ok(response);
      
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "getPostUploadUrl", e);
      return ResponseEntity.internalServerError().body(Map.of("error", "Failed to generate upload URL"));
    }
  }
  
  @PostMapping()
  public ResponseEntity<CreatePostResponse> createPost(
      @Valid @RequestBody CreatePostRequest request, Authentication authentication) {
    LoggingUtil.logControllerEntry(logger, "createPost", "request", request, "authentication", authentication != null ? "present" : "null");
    
    try {
      UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
      Post post = postService.createPost(userPrincipal, request);
      CreatePostResponse response = CreatePostResponse.builder().post(post).build();
      
      LoggingUtil.logControllerExit(logger, "createPost", response);
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "createPost", e);
      throw e;
    }
  }

  @GetMapping("/{id}")
  public ResponseEntity<GetPostResponse> getPost(@PathVariable int id) {
    LoggingUtil.logControllerEntry(logger, "getPost", "postId", id);
    
    try {
      Post post = postService.getPost(id);
      GetPostResponse response = GetPostResponse.builder().post(post).build();
      
      LoggingUtil.logControllerExit(logger, "getPost", response);
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "getPost", e);
      throw e;
    }
  }

  @GetMapping("/{id}/with-relationships")
  public ResponseEntity<GetPostResponse> getPostWithRelationships(@PathVariable int id) {
    LoggingUtil.logControllerEntry(logger, "getPostWithRelationships", "postId", id);
    
    try {
      Post post = postService.getPostWithAllRelationships(id);
      GetPostResponse response = GetPostResponse.builder().post(post).build();
      
      LoggingUtil.logControllerExit(logger, "getPostWithRelationships", response);
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "getPostWithRelationships", e);
      throw e;
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<DeletePostResponse> deletePost(@PathVariable int id, Authentication authentication) {
    LoggingUtil.logControllerEntry(logger, "deletePost", "postId", id, "authentication", authentication != null ? "present" : "null");
    
    try {
      UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
      postService.deletePost(userPrincipal, id);
      
      LoggingUtil.logControllerExit(logger, "deletePost", "Post deleted successfully");
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "deletePost", e);
      throw e;
    }
  }

  @PostMapping("/like/{id}")
  public ResponseEntity<GetPostResponse> likePost(@PathVariable int id, Authentication authentication) {
    LoggingUtil.logControllerEntry(logger, "likePost", "postId", id, "authentication", authentication != null ? "present" : "null");
    
    try {
      // Debug authentication details
      if (authentication != null) {
        logger.debug("Authentication details - Principal: {}, Authorities: {}, Authenticated: {}, Details: {}", 
          authentication.getPrincipal() != null ? authentication.getPrincipal().getClass().getSimpleName() : "null",
          authentication.getAuthorities() != null ? authentication.getAuthorities().size() : 0,
          authentication.isAuthenticated(),
          authentication.getDetails() != null ? authentication.getDetails().toString() : "null");
      } else {
        logger.warn("No authentication found for like request - postId: {}", id);
      }
      
      UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
      logger.debug("UserPrincipal details - Username: {}, Provider: {}, ProviderId: {}", 
        userPrincipal.getUsername(),
        userPrincipal.getProvider(),
        userPrincipal.getProviderId());
      
      Post post = postService.likePost(userPrincipal, id);
      GetPostResponse response = GetPostResponse.builder().post(post).build();
      
      LoggingUtil.logControllerExit(logger, "likePost", response);
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "likePost", e);
      throw e;
    }
  }

  @DeleteMapping("/like/{id}")
  public ResponseEntity<GetPostResponse> unlikePost(@PathVariable int id, Authentication authentication) {
    LoggingUtil.logControllerEntry(logger, "unlikePost", "postId", id, "authentication", authentication != null ? "present" : "null");
    
    try {
      // Debug authentication details
      if (authentication != null) {
        logger.debug("Authentication details - Principal: {}, Authorities: {}, Authenticated: {}, Details: {}", 
          authentication.getPrincipal() != null ? authentication.getPrincipal().getClass().getSimpleName() : "null",
          authentication.getAuthorities() != null ? authentication.getAuthorities().size() : 0,
          authentication.isAuthenticated(),
          authentication.getDetails() != null ? authentication.getDetails().toString() : "null");
      } else {
        logger.warn("No authentication found for unlike request - postId: {}", id);
      }
      
      UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
      logger.debug("UserPrincipal details - Username: {}, Provider: {}, ProviderId: {}", 
        userPrincipal.getUsername(),
        userPrincipal.getProvider(),
        userPrincipal.getProviderId());
      
      Post post = postService.unlikePost(userPrincipal, id);
      GetPostResponse response = GetPostResponse.builder().post(post).build();
      
      LoggingUtil.logControllerExit(logger, "unlikePost", response);
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "unlikePost", e);
      throw e;
    }
  }

  @GetMapping("/user/{id}")
  public ResponseEntity<GetUserPostResponse> getUserPosts(@PathVariable int id) {
    LoggingUtil.logControllerEntry(logger, "getUserPosts", "userId", id);
    
    try {
      List<Post> posts = postService.getUserPosts(id);
      GetUserPostResponse response = GetUserPostResponse.builder().posts(posts).build();
      
      LoggingUtil.logControllerExit(logger, "getUserPosts", "Posts count: " + posts.size());
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "getUserPosts", e);
      throw e;
    }
  }
}
