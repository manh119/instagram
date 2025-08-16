package com.engineerpro.example.redis.service;

import java.util.List;

import com.engineerpro.example.redis.dto.SuggestedUserResponse;
import com.engineerpro.example.redis.dto.UserPrincipal;

public interface UserService {
    List<SuggestedUserResponse> getSuggestedUsers(UserPrincipal userPrincipal, int limit);
    List<SuggestedUserResponse> searchUsers(UserPrincipal userPrincipal, String query, int limit);
}
