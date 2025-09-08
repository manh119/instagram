package com.engineerpro.example.redis.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.engineerpro.example.redis.dto.notification.NotificationResponse;
import com.engineerpro.example.redis.util.LoggingUtil;

import org.slf4j.Logger;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.DeserializationFeature;

@Service
public class RedisNotificationListener implements MessageListener {
    
    private static final Logger logger = LoggingUtil.getLogger(RedisNotificationListener.class);
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    private final ObjectMapper objectMapper;
    
    public RedisNotificationListener() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        this.objectMapper.configure(DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_AS_NULL, true);
    }
    
    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String channel = new String(message.getChannel());
            String payload = new String(message.getBody());
            
            // Extract user ID from channel (notification:userId)
            if (channel.startsWith("notification:")) {
                String userIdStr = channel.substring("notification:".length());
                Long userId = Long.parseLong(userIdStr);
                
                // Parse notification from payload
                NotificationResponse notification = objectMapper.readValue(payload, NotificationResponse.class);
                
                // Send to WebSocket if user is connected to this instance
                messagingTemplate.convertAndSend(
                    "/queue/user." + userId + ".notifications", 
                    notification
                );
                
                LoggingUtil.logBusinessEvent(logger, "Redis notification forwarded to WebSocket", 
                    "UserId", userId, "Channel", channel, "NotificationId", notification.getId());
            }
            
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to process Redis notification message", 
                "Channel", new String(message.getChannel()), "Payload", new String(message.getBody()), 
                "Error", e.getMessage());
        }
    }
}
