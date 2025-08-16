package com.engineerpro.example.redis.controller.auth;

import com.engineerpro.example.redis.dto.UserPrincipal;
import com.engineerpro.example.redis.dto.auth.JwtResponse;
import com.engineerpro.example.redis.dto.auth.RefreshTokenRequest;
import com.engineerpro.example.redis.dto.auth.UserInfoResponse;
import com.engineerpro.example.redis.security.JwtTokenUtil;
import com.engineerpro.example.redis.service.CustomUserDetailsService;
import com.engineerpro.example.redis.util.LoggingUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "JWT authentication and OAuth2 operations")
public class AuthController {

    private static final Logger logger = LoggingUtil.getLogger(AuthController.class);

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @GetMapping("/me")
    @Operation(
        summary = "Get current user information",
        description = "Retrieves information about the currently authenticated user"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User information retrieved successfully",
            content = @Content(schema = @Schema(implementation = UserInfoResponse.class))),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing JWT token")
    })
    public ResponseEntity<UserInfoResponse> getCurrentUser(Authentication authentication) {
        LoggingUtil.logEntry(logger, "authentication", authentication != null ? "present" : "null");
        
        try {
            if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
                UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
                
                UserInfoResponse response = UserInfoResponse.builder()
                        .username(userPrincipal.getUsername())
                        .name(userPrincipal.getName())
                        .picture(userPrincipal.getPicture())
                        .provider(userPrincipal.getProvider())
                        .providerId(userPrincipal.getProviderId())
                        .build();
                
                LoggingUtil.logExit(logger, response);
                return ResponseEntity.ok(response);
            }
            
            LoggingUtil.logExit(logger, "UNAUTHORIZED");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            LoggingUtil.logError(logger, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/refresh")
    @Operation(
        summary = "Refresh JWT token",
        description = "Refreshes an expired JWT token with a new one"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token refreshed successfully",
            content = @Content(schema = @Schema(implementation = JwtResponse.class))),
        @ApiResponse(responseCode = "401", description = "Unauthorized - invalid refresh token")
    })
    public ResponseEntity<JwtResponse> refreshToken(
        @Parameter(description = "Refresh token request", required = true)
        @Valid @RequestBody RefreshTokenRequest request) {
        
        LoggingUtil.logEntry(logger, "refreshTokenRequest", request);
        
        try {
            // Validate the current token
            if (jwtTokenUtil.validateToken(request.getToken())) {
                String username = jwtTokenUtil.extractUsername(request.getToken());
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                // Generate new token
                String newToken = jwtTokenUtil.generateToken(userDetails);
                
                JwtResponse response = JwtResponse.builder()
                        .token(newToken)
                        .type("Bearer")
                        .username(username)
                        .build();
                
                LoggingUtil.logExit(logger, "Token refreshed successfully for user: " + username);
                return ResponseEntity.ok(response);
            } else {
                LoggingUtil.logExit(logger, "Invalid refresh token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        } catch (Exception e) {
            LoggingUtil.logError(logger, e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/validate")
    @Operation(
        summary = "Validate JWT token",
        description = "Validates if a JWT token is still valid"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token is valid"),
        @ApiResponse(responseCode = "401", description = "Token is invalid or expired")
    })
    public ResponseEntity<Void> validateToken(
        @Parameter(description = "JWT token to validate", required = false)
        @RequestHeader(value = "Authorization", required = false) String authorization) {
        
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        try {
            String token = authorization.substring(7);
            
            if (jwtTokenUtil.validateToken(token)) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/logout")
    @Operation(
        summary = "Logout user",
        description = "Logs out the current user (client should discard JWT token)"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Logout successful")
    })
    public ResponseEntity<Void> logout() {
        // In a stateless JWT setup, logout is handled client-side
        // The client should discard the JWT token
        return ResponseEntity.ok().build();
    }
}
