package com.engineerpro.example.redis.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
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
	}

	@Override
	public void configureMessageBroker(MessageBrokerRegistry config) {
		// Check if we're in production mode
		boolean isProduction = environment.acceptsProfiles("docker-compose", "prod");
		
		if (isProduction) {
			// For production with RabbitMQ STOMP relay
			config.enableStompBrokerRelay("/topic", "/user", "/queue")
					.setRelayHost(relayHost)
					.setRelayPort(relayPort)
					.setClientLogin(relayLogin)
					.setClientPasscode(relayPasscode);
		} else {
			// For development, use simple broker
			config.enableSimpleBroker("/topic", "/user", "/queue");
		}
		
		config.setApplicationDestinationPrefixes("/app");
		config.setUserDestinationPrefix("/user");
	}

	@Override
	public void registerStompEndpoints(StompEndpointRegistry registry) {
		registry.addEndpoint("/ws")
			.setAllowedOriginPatterns("*")
			.withSockJS();
		registry.addEndpoint("/ws")
			.setAllowedOriginPatterns("*");
	}
}
