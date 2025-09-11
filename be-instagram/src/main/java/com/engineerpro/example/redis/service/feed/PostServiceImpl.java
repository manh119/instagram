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
import com.engineerpro.example.redis.service.profile.ProfileService;
import com.engineerpro.example.redis.service.NotificationService;
import com.engineerpro.example.redis.util.LoggingUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.engineerpro.example.redis.repository.FeedRepository;

import org.slf4j.Logger;

@Service
public class PostServiceImpl implements PostService {

  private static final Logger logger = LoggingUtil.getLogger(PostServiceImpl.class);

  @Autowired
  private ProfileService profileService;

  @Autowired
  private PostRepository postRepository;

  @Autowired
  private FeedRepository feedRepository;

  @Autowired
  private NotificationService notificationService;

  @Autowired
  RabbitTemplate rabbitTemplate;

  @Autowired
  ObjectMapper objectMapper;

  @Override
  public Post createPost(UserPrincipal userPrincipal, CreatePostRequest request) {
    LoggingUtil.logBusinessEvent(logger, "Creating new post", "Username", userPrincipal.getUsername());

    try {
      // Log request details
      LoggingUtil.logServiceDebug(logger, "Post creation request details",
          "Username", userPrincipal.getUsername(),
          "Has Image", request.hasImage(),
          "Has Video", request.hasVideo(),
          "Image Length", request.getImageLength(),
          "Video Length", request.getVideoLength(),
          "Video Format", request.getVideoFormat(),
          "Caption Length", request.getCaption() != null ? request.getCaption().length() : 0);

      Profile profile = profileService.getUserProfile(userPrincipal);
      LoggingUtil.logServiceDebug(logger, "Profile retrieved for post creation", "Profile ID", profile.getId());

      Post post = new Post();
      post.setCaption(request.getCaption());
      post.setCreatedAt(new Date());
      post.setCreatedBy(profile);
      post.setImageUrl(request.getImageUrl());

      Post savedPost = postRepository.save(post);
      LoggingUtil.logBusinessEvent(logger, "Post created successfully",
          "Post ID", savedPost.getId(),
          "Username", userPrincipal.getUsername(),
          "Media Type", post.getVideoUrl() != null ? "Video" : "Image",
          "Video Format", post.getVideoUrl() != null ? request.getVideoFormat() : "N/A");

      rabbitTemplate.convertAndSend(MessageQueueConfig.AFTER_CREATE_POST_QUEUE, post.getId());
      LoggingUtil.logServiceDebug(logger, "Post creation event sent to queue", "Post ID", post.getId());

      // Create new post notifications for followers
      notificationService.createNewPostNotification(savedPost);

      return savedPost;
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to create post",
          "Username", userPrincipal.getUsername(),
          "Error", e.getMessage(),
          "Error Type", e.getClass().getSimpleName());
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

      // Remove post from all feeds before deleting
      LoggingUtil.logServiceDebug(logger, "Removing post from all feeds", "Post ID", postId);
      feedRepository.removePostFromAllFeeds(postId);

      // Delete the post (cascade will handle comments and notifications)
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

      postRepository.save(post);

      // Create like notification
      notificationService.createLikeNotification(profile, post);

      // Fetch the updated post with all relationships to return complete data
      Post updatedPost = postRepository.findByIdWithAllRelationships(postId);

      LoggingUtil.logBusinessEvent(logger, "Post liked successfully", "Post ID", postId, "Username", userPrincipal.getUsername());

      return updatedPost;
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

      postRepository.save(post);

      // Fetch the updated post with all relationships to return complete data
      Post updatedPost = postRepository.findByIdWithAllRelationships(postId);

      LoggingUtil.logBusinessEvent(logger, "Post unliked successfully", "Post ID", postId, "Username", userPrincipal.getUsername());

      return updatedPost;
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
      // Use the new method that eagerly loads all relationships
      List<Post> posts = postRepository.findByCreatedByIdWithAllRelationships(profile.getId());

      LoggingUtil.logServiceDebug(logger, "User posts retrieved successfully", "User ID", userId, "Posts Count", posts.size());
      return posts;
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to retrieve user posts", "User ID", userId, "Error", e.getMessage());
      throw e;
    }
  }

  @Override
  public List<Post> getLikedPosts(int userId) {
    LoggingUtil.logServiceDebug(logger, "Retrieving liked posts", "User ID", userId);

    try {
      Profile profile = profileService.getUserProfile(userId);
      // Get posts that the user has liked
      List<Post> likedPosts = postRepository.findByUserLikesIdWithAllRelationships(profile.getId());

      LoggingUtil.logServiceDebug(logger, "Liked posts retrieved successfully", "User ID", userId, "Liked Posts Count", likedPosts.size());
      return likedPosts;
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to retrieve liked posts", "User ID", userId, "Error", e.getMessage());
      throw e;
    }
  }

  @Override
  public Post getPostWithAllRelationships(int postId) {
    LoggingUtil.logServiceDebug(logger, "Retrieving post with all relationships", "Post ID", postId);

    try {
      Post post = postRepository.findById(postId).orElseThrow(PostNotFoundException::new);
      LoggingUtil.logServiceDebug(logger, "Post with relationships retrieved successfully", "Post ID", postId);
      return post;
    } catch (PostNotFoundException e) {
      LoggingUtil.logServiceWarning(logger, "Post not found", "Post ID", postId);
      throw e;
    }
  }
}
