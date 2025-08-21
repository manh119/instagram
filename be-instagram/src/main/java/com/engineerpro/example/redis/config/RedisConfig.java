package com.engineerpro.example.redis.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.GenericToStringSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.engineerpro.example.redis.service.RedisNotificationListener;

@Configuration
public class RedisConfig {
    
    @Autowired
    private RedisNotificationListener notificationListener;
    
    @Bean
    public RedisTemplate<String, Long> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Long> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Set key serializer to String
        template.setKeySerializer(new StringRedisSerializer());

        // Set value serializer to Long
        template.setValueSerializer(new GenericToStringSerializer<>(Long.class));

        return template;
    }
    
    @Bean
    public RedisMessageListenerContainer redisMessageListenerContainer(RedisConnectionFactory connectionFactory) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        
        // Add listener for notification channels
        MessageListenerAdapter listenerAdapter = new MessageListenerAdapter(notificationListener, "onMessage");
        container.addMessageListener(listenerAdapter, 
            org.springframework.data.redis.listener.PatternTopic.of("notification:*"));
        
        return container;
    }
}
