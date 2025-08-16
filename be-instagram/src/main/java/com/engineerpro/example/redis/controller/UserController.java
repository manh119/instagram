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
import com.engineerpro.example.redis.util.LoggingUtil;

import org.slf4j.Logger;

@RestController
@RequestMapping("/users")
public class UserController {

    private static final Logger logger = LoggingUtil.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @GetMapping("/suggested")
    public ResponseEntity<List<SuggestedUserResponse>> getSuggestedUsers(
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        
        LoggingUtil.logControllerEntry(logger, "getSuggestedUsers", "limit", limit, "authentication", authentication != null ? "present" : "null");
        
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            LoggingUtil.logServiceDebug(logger, "Getting suggested users", "Username", userPrincipal.getUsername(), "Limit", limit);
            
            List<SuggestedUserResponse> suggestedUsers = userService.getSuggestedUsers(userPrincipal, limit);
            
            LoggingUtil.logControllerExit(logger, "getSuggestedUsers", "Suggested users count: " + suggestedUsers.size());
            return ResponseEntity.ok(suggestedUsers);
        } catch (Exception e) {
            LoggingUtil.logControllerError(logger, "getSuggestedUsers", e);
            throw e;
        }
    }
}
