package com.engineerpro.example.redis.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow requests from React development server
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:3000", // Create React App default
                "http://localhost:3001", // Frontend production port
                "http://localhost:5173", // Vite default
                "http://localhost:8080" // Your backenkend port
        ));

        // Allow common HTTP methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Allow common headers
        configuration.setAllowedHeaders(Arrays.asList(
            "Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"
        ));

        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);

        // How long the response to preflight requests can be cached
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
