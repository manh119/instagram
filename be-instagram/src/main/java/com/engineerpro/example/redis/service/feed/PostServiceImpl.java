package com.engineerpro.example.redis.service.feed;

import java.util.Date;
import java.util.List;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.engineerpro.example.redis.config.MessageQueueConfig;
import com.engineerpro.example.redis.dto.UserPrincipal;
import com.engineerpro.example.redis.dto.feed.CreatePostRequest;
import com.engineerpro.example.redis.exception.NoPermissionException;
import com.engineerpro.example.redis.exception.PostNotFoundException;
import com.engineerpro.example.redis.model.Post;
import com.engineerpro.example.redis.model.Profile;
import com.engineerpro.example.redis.repository.PostRepository;
import com.engineerpro.example.redis.service.UploadService;
import com.engineerpro.example.redis.service.profile.ProfileService;
import com.engineerpro.example.redis.util.LoggingUtil;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;

@Service
public class PostServiceImpl implements PostService {
  
  private static final Logger logger = LoggingUtil.getLogger(PostServiceImpl.class);
  
  @Autowired
  private ProfileService profileService;

  @Autowired
  private UploadService uploadService;

  @Autowired
  private PostRepository postRepository;

  @Autowired
  RabbitTemplate rabbitTemplate;

  @Autowired
  ObjectMapper objectMapper;

  @Override
  public Post createPost(UserPrincipal userPrincipal, CreatePostRequest request) {
    LoggingUtil.logBusinessEvent(logger, "Creating new post", "Username", userPrincipal.getUsername());
    
    try {
      Profile profile = profileService.getUserProfile(userPrincipal);
      LoggingUtil.logServiceDebug(logger, "Profile retrieved for post creation", "Profile ID", profile.getId());
      
      String url = uploadService.uploadImage(request.getBase64ImageString());
      LoggingUtil.logServiceDebug(logger, "Image uploaded successfully", "Image URL", url);
      
      Post post = new Post();
      post.setCaption(request.getCaption());
      post.setCreatedAt(new Date());
      post.setCreatedBy(profile);
      post.setImageUrl(url);
      
      Post savedPost = postRepository.save(post);
      LoggingUtil.logBusinessEvent(logger, "Post created successfully", "Post ID", savedPost.getId(), "Username", userPrincipal.getUsername());

      rabbitTemplate.convertAndSend(MessageQueueConfig.AFTER_CREATE_POST_QUEUE, post.getId());
      LoggingUtil.logServiceDebug(logger, "Post creation event sent to queue", "Post ID", post.getId());

      return savedPost;
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to create post", "Username", userPrincipal.getUsername(), "Error", e.getMessage());
      throw e;
    }
  }

  @Override
  public Post getPost(int postId) {
    LoggingUtil.logServiceDebug(logger, "Retrieving post", "Post ID", postId);
    
    try {
      Post post = postRepository.findById(postId).orElseThrow(PostNotFoundException::new);
      LoggingUtil.logServiceDebug(logger, "Post retrieved successfully", "Post ID", postId);
      return post;
    } catch (PostNotFoundException e) {
      LoggingUtil.logServiceWarning(logger, "Post not found", "Post ID", postId);
      throw e;
    }
  }

  @Override
  public void deletePost(UserPrincipal userPrincipal, int postId) {
    LoggingUtil.logBusinessEvent(logger, "Deleting post", "Username", userPrincipal.getUsername(), "Post ID", postId);
    
    try {
      Profile profile = profileService.getUserProfile(userPrincipal);
      Post post = postRepository.findById(postId).orElseThrow(PostNotFoundException::new);
      
      if (post.getCreatedBy().getId() != profile.getId()) {
        LoggingUtil.logServiceWarning(logger, "Permission denied for post deletion", 
            "Username", userPrincipal.getUsername(), "Post ID", postId, "Post Owner ID", post.getCreatedBy().getId());
        throw new NoPermissionException();
      }
      
      postRepository.delete(post);
      LoggingUtil.logBusinessEvent(logger, "Post deleted successfully", "Post ID", postId, "Username", userPrincipal.getUsername());
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to delete post", "Username", userPrincipal.getUsername(), "Post ID", postId, "Error", e.getMessage());
      throw e;
    }
  }

  @Override
  public Post likePost(UserPrincipal userPrincipal, int postId) {
    LoggingUtil.logBusinessEvent(logger, "Liking post", "Username", userPrincipal.getUsername(), "Post ID", postId);
    
    try {
      Profile profile = profileService.getUserProfile(userPrincipal);
      Post post = getPost(postId);
      post.getUserLikes().add(profile);
      
      Post savedPost = postRepository.save(post);
      LoggingUtil.logBusinessEvent(logger, "Post liked successfully", "Post ID", postId, "Username", userPrincipal.getUsername());
      
      return savedPost;
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to like post", "Username", userPrincipal.getUsername(), "Post ID", postId, "Error", e.getMessage());
      throw e;
    }
  }

  @Override
  public Post unlikePost(UserPrincipal userPrincipal, int postId) {
    LoggingUtil.logBusinessEvent(logger, "Unliking post", "Username", userPrincipal.getUsername(), "Post ID", postId);
    
    try {
      Profile profile = profileService.getUserProfile(userPrincipal);
      Post post = getPost(postId);
      post.getUserLikes().remove(profile);
      
      Post savedPost = postRepository.save(post);
      LoggingUtil.logBusinessEvent(logger, "Post unliked successfully", "Post ID", postId, "Username", userPrincipal.getUsername());
      
      return savedPost;
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to unlike post", "Username", userPrincipal.getUsername(), "Post ID", postId, "Error", e.getMessage());
      throw e;
    }
  }

  @Override
  public List<Post> getUserPosts(int userId) {
    LoggingUtil.logServiceDebug(logger, "Retrieving user posts", "User ID", userId);
    
    try {
      Profile profile = profileService.getUserProfile(userId);
      List<Post> posts = postRepository.findByCreatedBy(profile);
      
      LoggingUtil.logServiceDebug(logger, "User posts retrieved successfully", "User ID", userId, "Posts Count", posts.size());
      return posts;
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to retrieve user posts", "User ID", userId, "Error", e.getMessage());
      throw e;
    }
  }
}
