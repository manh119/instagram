package com.engineerpro.example.redis.config;

import org.slf4j.Logger;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.engineerpro.example.redis.util.LoggingUtil;

@Configuration
@EnableWebSocketMessageBroker
@Order(1)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
	private static final Logger logger = LoggingUtil.getLogger(WebSocketConfig.class);

	public WebSocketConfig() {
		logger.info("=== WebSocketConfig constructor called ===");
		logger.info("=== WebSocketConfig class loaded in Docker ===");
	}

	@Override
	public void configureMessageBroker(MessageBrokerRegistry config) {
		logger.info("=== Configuring WebSocket Message Broker ===");

		// Use RabbitMQ STOMP relay for both development and production
		config.enableStompBrokerRelay("/topic", "/queue", "/user")
				.setRelayHost("rabbitmq")
				.setRelayPort(61613)
				.setClientLogin("guest")
				.setClientPasscode("guest");

		config.setApplicationDestinationPrefixes("/app");
		config.setUserDestinationPrefix("/user");

		logger.info("=== WebSocket Message Broker Configuration Complete ===");
	}

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		logger.info("=== Registering WebSocket STOMP Endpoints ===");

		registry.addEndpoint("/api/ws")
				.setAllowedOriginPatterns("*")
				.withSockJS();

		registry.addEndpoint("/api/ws")
				.setAllowedOriginPatterns("*");

		logger.info("=== WebSocket STOMP Endpoints Registration Complete ===");
	}
}
