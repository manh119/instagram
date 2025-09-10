package com.engineerpro.example.redis.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

public class DotenvApplicationContextInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory("./")
                    .filename(".env.dev")
                    .load();

            ConfigurableEnvironment environment = applicationContext.getEnvironment();
            
            // Convert dotenv entries to Map
            Map<String, Object> dotenvProperties = new HashMap<>();
            dotenv.entries().forEach(entry -> {
                dotenvProperties.put(entry.getKey(), entry.getValue());
            });

            // Add dotenv properties to Spring environment
            MapPropertySource dotenvPropertySource = new MapPropertySource("dotenv", dotenvProperties);
            environment.getPropertySources().addFirst(dotenvPropertySource);
            
            System.out.println("Successfully loaded " + dotenvProperties.size() + " environment variables from .env.dev");
        } catch (Exception e) {
            System.err.println("Warning: Could not load .env.dev file: " + e.getMessage());
            System.err.println("Application will continue with system environment variables only.");
        }
    }
}
