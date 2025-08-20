package com.engineerpro.example.redis.service;

import java.util.List;
import java.util.Optional;

import com.engineerpro.example.redis.dto.SuggestedUserResponse;
import com.engineerpro.example.redis.dto.UserPrincipal;
import com.engineerpro.example.redis.model.User;

public interface UserService {
    List<SuggestedUserResponse> getSuggestedUsers(UserPrincipal userPrincipal, int limit);
    List<SuggestedUserResponse> searchUsers(UserPrincipal userPrincipal, String query, int limit);
    
    // User registration and management
    User createUser(String username, String password, String name);
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}
