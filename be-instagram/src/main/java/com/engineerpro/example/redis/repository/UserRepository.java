package com.engineerpro.example.redis.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.engineerpro.example.redis.model.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = "authorities")
    Optional<User> findByUsername(String username);
    
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    
    boolean existsByUsername(String username);
}
