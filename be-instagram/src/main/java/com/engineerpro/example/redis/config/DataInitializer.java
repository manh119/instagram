package com.engineerpro.example.redis.config;

import com.engineerpro.example.redis.model.Authority;
import com.engineerpro.example.redis.repository.AuthorityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AuthorityRepository authorityRepository;

    @Override
    public void run(String... args) throws Exception {
        initializeAuthorities();
    }

    private void initializeAuthorities() {
        List<String> defaultAuthorities = Arrays.asList(
            "ROLE_USER",
            "ROLE_ADMIN"
        );

        for (String authorityName : defaultAuthorities) {
            if (!authorityRepository.findByAuthority(authorityName).isPresent()) {
                Authority authority = new Authority();
                authority.setAuthority(authorityName);
                authorityRepository.save(authority);
                System.out.println("✅ Created authority: " + authorityName);
            }
        }
    }
}
