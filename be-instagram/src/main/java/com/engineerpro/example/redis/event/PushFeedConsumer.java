package com.engineerpro.example.redis.event;

import java.util.List;

import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;

import com.engineerpro.example.redis.config.MessageQueueConfig;
import com.engineerpro.example.redis.model.Post;
import com.engineerpro.example.redis.model.UserFollowing;
import com.engineerpro.example.redis.repository.FeedRepository;
import com.engineerpro.example.redis.repository.FollowerRepository;
import com.engineerpro.example.redis.repository.NotificationRepository;
import com.engineerpro.example.redis.service.feed.PostService;
import com.engineerpro.example.redis.service.profile.FollowerService;
import com.engineerpro.example.redis.service.profile.ProfileService;
import com.engineerpro.example.redis.util.LoggingUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;

@RabbitListener(queues = MessageQueueConfig.AFTER_CREATE_POST_QUEUE)
public class PushFeedConsumer {

    private static final Logger logger = LoggingUtil.getLogger(PushFeedConsumer.class);
    
    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    ProfileService profileService;

    @Autowired
    PostService postService;

    @Autowired
    FollowerRepository followerRepository;

    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    FeedRepository feedRepository;

    @RabbitHandler
    public void receive(Integer postId) throws JsonMappingException, JsonProcessingException {
        LoggingUtil.logBusinessEvent(logger, "Feed update message received", "postId", postId);
        
        try {
            Post post = postService.getPost(postId);
            LoggingUtil.logServiceDebug(logger, "Post retrieved for feed update", "postId", postId, "creatorId", post.getCreatedBy().getId());

            List<UserFollowing> followerList = followerRepository.findByFollowingUserId(post.getCreatedBy().getId());
            LoggingUtil.logServiceDebug(logger, "Followers found for post creator", "followerCount", followerList.size());

            for (UserFollowing userFollowing : followerList) {
                LoggingUtil.logServiceDebug(logger, "Adding post to follower's feed", "followerId", userFollowing.getFollowerUserId(), "postId", postId);
                feedRepository.addPostToFeed(post.getId(), userFollowing.getFollowerUserId());
            }
            
            LoggingUtil.logBusinessEvent(logger, "Feed update completed successfully", "postId", postId, "followerCount", followerList.size());
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to process feed update", "postId", postId, "Error", e.getMessage());
            throw e;
        }
    }
}
