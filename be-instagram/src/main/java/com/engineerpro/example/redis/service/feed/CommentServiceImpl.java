package com.engineerpro.example.redis.service.feed;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.engineerpro.example.redis.dto.UserPrincipal;
import com.engineerpro.example.redis.dto.feed.CreateCommentRequest;
import com.engineerpro.example.redis.exception.CommentNotFoundException;
import com.engineerpro.example.redis.exception.NoPermissionException;
import com.engineerpro.example.redis.exception.PostNotFoundException;
import com.engineerpro.example.redis.model.Comment;
import com.engineerpro.example.redis.model.Post;
import com.engineerpro.example.redis.model.Profile;
import com.engineerpro.example.redis.repository.CommentRepository;
import com.engineerpro.example.redis.repository.PostRepository;
import com.engineerpro.example.redis.service.profile.ProfileService;
import com.engineerpro.example.redis.util.LoggingUtil;

import org.slf4j.Logger;

@Service
public class CommentServiceImpl implements CommentService {
  
  private static final Logger logger = LoggingUtil.getLogger(CommentServiceImpl.class);
  
  @Autowired
  private ProfileService profileService;

  @Autowired
  private PostRepository postRepository;

  @Autowired
  private CommentRepository commentRepository;

  @Override
  public Post createComment(UserPrincipal userPrincipal, CreateCommentRequest request) {
    LoggingUtil.logBusinessEvent(logger, "Creating comment", 
      "Username", userPrincipal.getUsername(), 
      "Post ID", request.getPostId());
    
    try {
      Profile profile = profileService.getUserProfile(userPrincipal);
      Post post = postRepository.findById(request.getPostId()).orElseThrow(PostNotFoundException::new);
      
      Comment comment = new Comment();
      comment.setContent(request.getComment()); // Use the new field name
      comment.setCreatedAt(new Date());
      comment.setCreatedBy(profile);
      comment.setPost(post);
      
      commentRepository.save(comment);
      
      LoggingUtil.logBusinessEvent(logger, "Comment created successfully", 
        "Comment ID", comment.getId(),
        "Username", userPrincipal.getUsername(),
        "Post ID", request.getPostId());
      
      return post;
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to create comment", 
        "Username", userPrincipal.getUsername(),
        "Post ID", request.getPostId(),
        "Error", e.getMessage());
      throw e;
    }
  }

  @Override
  public Post deleteComment(UserPrincipal userPrincipal, int commentId) {
    LoggingUtil.logBusinessEvent(logger, "Deleting comment", 
      "Username", userPrincipal.getUsername(), 
      "Comment ID", commentId);
    
    try {
      Profile profile = profileService.getUserProfile(userPrincipal);
      Comment comment = commentRepository.findById(commentId).orElseThrow(CommentNotFoundException::new);
      
      if (comment.getCreatedBy().getId() != profile.getId()) {
        LoggingUtil.logServiceWarning(logger, "Permission denied for comment deletion", 
          "Username", userPrincipal.getUsername(),
          "Comment ID", commentId,
          "Comment Owner ID", comment.getCreatedBy().getId());
        throw new NoPermissionException();
      }
      
      commentRepository.delete(comment);
      
      LoggingUtil.logBusinessEvent(logger, "Comment deleted successfully", 
        "Comment ID", commentId,
        "Username", userPrincipal.getUsername());
      
      return comment.getPost();
    } catch (Exception e) {
      LoggingUtil.logServiceWarning(logger, "Failed to delete comment", 
        "Username", userPrincipal.getUsername(),
        "Comment ID", commentId,
        "Error", e.getMessage());
      throw e;
    }
  }
}
