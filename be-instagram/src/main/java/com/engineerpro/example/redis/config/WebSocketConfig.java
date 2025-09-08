package com.engineerpro.example.redis.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
	
	private static final Logger logger = LoggerFactory.getLogger(WebSocketConfig.class);
	
	@Value("${spring.rabbitmq.stomp.relay.host}")
	private String relayHost;

	@Value("${spring.rabbitmq.stomp.relay.port}")
	private int relayPort;

	@Value("${spring.rabbitmq.stomp.relay.login}")
	private String relayLogin;

	@Value("${spring.rabbitmq.stomp.relay.passcode}")
	private String relayPasscode;
	
	private final Environment environment;
	
	public WebSocketConfig(Environment environment) {
		this.environment = environment;
		logger.info("=== WebSocket Configuration Initialized ===");
		        logger.info("Environment: {}", (Object[]) environment.getActiveProfiles());
	}

	@Override
	public void configureMessageBroker(MessageBrokerRegistry config) {
		logger.info("=== Configuring WebSocket Message Broker ===");
		
		// Check if we're in production mode
		boolean isProduction = environment.acceptsProfiles("docker-compose", "prod");
		logger.info("Production mode: {}", isProduction);
		
		if (isProduction) {
			logger.info("=== Using RabbitMQ STOMP Relay ===");
			logger.info("Relay Host: {}", relayHost);
			logger.info("Relay Port: {}", relayPort);
			logger.info("Relay Login: {}", relayLogin);
			
			// For production with RabbitMQ STOMP relay - use only /topic and /queue
			config.enableStompBrokerRelay("/topic", "/queue")
					.setRelayHost(relayHost)
					.setRelayPort(relayPort)
					.setClientLogin(relayLogin)
					.setClientPasscode(relayPasscode);
		} else {
			logger.info("=== Using Simple In-Memory Broker ===");
			// For development, use simple broker
			config.enableSimpleBroker("/topic", "/user", "/queue");
		}
		
		config.setApplicationDestinationPrefixes("/app");
		config.setUserDestinationPrefix("/user");
		
		logger.info("=== WebSocket Message Broker Configuration Complete ===");
		logger.info("Application prefixes: /app");
		logger.info("User destination prefix: /user");
		logger.info("Broker destinations: /topic, /user, /queue");
	}

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		logger.info("=== Registering WebSocket STOMP Endpoints ===");
		
		registry.addEndpoint("/api/ws")
			.setAllowedOriginPatterns("*")
			.withSockJS();
		logger.info("STOMP endpoint registered: /api/ws (with SockJS)");
		
		registry.addEndpoint("/api/ws")
			.setAllowedOriginPatterns("*");
		logger.info("STOMP endpoint registered: /api/ws (native WebSocket)");
		
		logger.info("=== WebSocket STOMP Endpoints Registration Complete ===");
		logger.info("Allowed origin patterns: *");
	}
}
