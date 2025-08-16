package com.engineerpro.example.redis.controller.feed;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.engineerpro.example.redis.dto.UserPrincipal;
import com.engineerpro.example.redis.dto.feed.CreateCommentRequest;
import com.engineerpro.example.redis.dto.feed.GetPostResponse;
import com.engineerpro.example.redis.model.Post;
import com.engineerpro.example.redis.service.feed.CommentService;
import com.engineerpro.example.redis.util.LoggingUtil;

import jakarta.validation.Valid;
import org.slf4j.Logger;

@RestController
@RequestMapping(path = "/comments")
public class CommentController {
  
  private static final Logger logger = LoggingUtil.getLogger(CommentController.class);
  
  @Autowired
  CommentService commentService;

  @PostMapping()
  public ResponseEntity<GetPostResponse> createComment(
      @Valid @RequestBody CreateCommentRequest request, Authentication authentication) {
    LoggingUtil.logControllerEntry(logger, "createComment", "request", request, "authentication", authentication != null ? "present" : "null");
    
    try {
      UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
      Post post = commentService.createComment(userPrincipal, request);
      GetPostResponse response = GetPostResponse.builder().post(post).build();
      
      LoggingUtil.logControllerExit(logger, "createComment", response);
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "createComment", e);
      throw e;
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<GetPostResponse> deleteComment(@PathVariable int id, Authentication authentication) {
    LoggingUtil.logControllerEntry(logger, "deleteComment", "commentId", id, "authentication", authentication != null ? "present" : "null");
    
    try {
      UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
      Post post = commentService.deleteComment(userPrincipal, id);
      GetPostResponse response = GetPostResponse.builder().post(post).build();
      
      LoggingUtil.logControllerExit(logger, "deleteComment", response);
      return ResponseEntity.ok().body(response);
    } catch (Exception e) {
      LoggingUtil.logControllerError(logger, "deleteComment", e);
      throw e;
    }
  }
}
