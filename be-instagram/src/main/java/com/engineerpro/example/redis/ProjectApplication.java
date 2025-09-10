package com.engineerpro.example.redis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import com.engineerpro.example.redis.util.LoggingUtil;
import com.engineerpro.example.redis.config.DotenvApplicationContextInitializer;
import org.slf4j.Logger;

@SpringBootApplication
public class ProjectApplication {

	private static final Logger logger = LoggingUtil.getLogger(ProjectApplication.class);

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(ProjectApplication.class);
		app.addInitializers(new DotenvApplicationContextInitializer());
		
		ConfigurableApplicationContext context = app.run(args);
		LoggingUtil.logBusinessEvent(logger, "Instagram Backend Application Started Successfully!");
	}
}
