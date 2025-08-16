package com.engineerpro.example.redis.dto.profile;

import com.engineerpro.example.redis.model.Profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class GetProfileResponse {
    private Profile profile;
    private int followersCount;
    private int followingCount;
    private int postsCount;
}
