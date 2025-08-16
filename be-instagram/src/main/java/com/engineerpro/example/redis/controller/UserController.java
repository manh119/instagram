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
import com.engineerpro.example.redis.dto.UserSearchResponse;
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

        LoggingUtil.logControllerEntry(logger, "getSuggestedUsers", "limit", limit, "authentication",
                authentication != null ? "present" : "null");

        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            LoggingUtil.logServiceDebug(logger, "Getting suggested users", "Username", userPrincipal.getUsername(),
                    "Limit", limit);

            List<SuggestedUserResponse> suggestedUsers = userService.getSuggestedUsers(userPrincipal, limit);

            LoggingUtil.logControllerExit(logger, "getSuggestedUsers",
                    "Suggested users count: " + suggestedUsers.size());
            return ResponseEntity.ok(suggestedUsers);
        } catch (Exception e) {
            LoggingUtil.logControllerError(logger, "getSuggestedUsers", e);
            throw e;
        }
    }

    @GetMapping("/search")
    public ResponseEntity<UserSearchResponse> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {

        LoggingUtil.logControllerEntry(logger, "searchUsers", "query", query, "limit", limit, "authentication",
                authentication != null ? "present" : "null");

        try {
            // Validate search query length
            if (query == null || query.trim().length() < 2) {
                LoggingUtil.logControllerEntry(logger, "Search query too short", "query", query, "length",
                        query != null ? query.length() : 0);
                return ResponseEntity.badRequest().body(UserSearchResponse.builder()
                        .users(List.of())
                        .query(query)
                        .totalCount(0)
                        .build());
            }

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            LoggingUtil.logServiceDebug(logger, "Searching users", "Query", query, "Username",
                    userPrincipal.getUsername(), "Limit", limit);

            List<SuggestedUserResponse> searchResults = userService.searchUsers(userPrincipal, query, limit);

            LoggingUtil.logControllerExit(logger, "searchUsers", "Search results count: " + searchResults.size());
            return ResponseEntity.ok(UserSearchResponse.builder()
                    .users(searchResults)
                    .query(query)
                    .totalCount(searchResults.size())
                    .build());
        } catch (Exception e) {
            LoggingUtil.logControllerError(logger, "searchUsers", e);
            throw e;
        }
    }
}
