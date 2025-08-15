package com.engineerpro.example.redis.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.engineerpro.example.redis.dto.SuggestedUserResponse;
import com.engineerpro.example.redis.dto.UserPrincipal;
import com.engineerpro.example.redis.service.UserService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/users")
@Slf4j
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/suggested")
    public ResponseEntity<List<SuggestedUserResponse>> getSuggestedUsers(
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        log.info("Getting suggested users for user: {}, limit: {}", userPrincipal.getUsername(), limit);
        
        List<SuggestedUserResponse> suggestedUsers = userService.getSuggestedUsers(userPrincipal, limit);
        log.info("Found {} suggested users", suggestedUsers.size());
        
        return ResponseEntity.ok(suggestedUsers);
    }
}
