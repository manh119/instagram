package com.engineerpro.example.redis;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.engineerpro.example.redis.util.LoggingUtil;
import org.slf4j.Logger;

@SpringBootApplication
public class ProjectApplication {

	private static final Logger logger = LoggingUtil.getLogger(ProjectApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(ProjectApplication.class, args);
		LoggingUtil.logBusinessEvent(logger, "Instagram Backend Application Started Successfully!");
	}
}
