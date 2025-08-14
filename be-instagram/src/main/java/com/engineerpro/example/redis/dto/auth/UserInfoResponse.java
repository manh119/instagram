package com.engineerpro.example.redis.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserInfoResponse {
    private String username;
    private String name;
    private String picture;
    private String provider;
    private String providerId;
}

