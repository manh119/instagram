package com.engineerpro.example.redis.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {
    private String token;
    private String type;
    private String username;
    private Long userId;  // Add numeric user ID
    private String provider;
    private String providerId;
}

