package com.engineerpro.example.redis.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.Environment;
import org.springframework.beans.factory.annotation.Autowired;

import jakarta.annotation.PostConstruct;

@Configuration
@PropertySource(value = "classpath:application.yml", ignoreResourceNotFound = true)
@Profile("dev") // only run when dev profile is active, run with .env.dev by
                // SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
public class DotenvConfig {

    @Autowired
    private Environment environment;

    @PostConstruct
    public void loadDotenv() {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory("./")
                    .filename(".env.dev")
                    .ignoreIfMalformed()
                    .ignoreIfMissing()
                    .load();

            // Add dotenv properties to Spring environment
            if (environment instanceof ConfigurableEnvironment) {
                ConfigurableEnvironment configurableEnvironment = (ConfigurableEnvironment) environment;
                configurableEnvironment.getPropertySources()
                        .addFirst(new EnvPropertySource("dotenv", dotenv));
            }
        } catch (Exception e) {
            // Log warning but don't fail startup - environment variables from Docker
            // Compose should take precedence
            System.err.println("Warning: Could not load .env.dev file: " + e.getMessage());
            System.err.println("Application will continue with system environment variables only.");
        }
    }
}
