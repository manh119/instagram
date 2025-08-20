package com.engineerpro.example.redis.service;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.engineerpro.example.redis.dto.Oauth2UserInfoDto;
import com.engineerpro.example.redis.dto.UserPrincipal;
import com.engineerpro.example.redis.model.User;
import com.engineerpro.example.redis.repository.UserRepository;
import com.engineerpro.example.redis.util.LoggingUtil;

import java.util.Optional;
import org.slf4j.Logger;

@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger logger = LoggingUtil.getLogger(OAuth2UserService.class);
    
    private final UserRepository userRepository;

    @Override
    @SneakyThrows
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) {
        LoggingUtil.logServiceDebug(logger, "Loading OAuth2 user", "clientRegistration", oAuth2UserRequest.getClientRegistration().getRegistrationId());
        
        try {
            OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);
            OAuth2User processedUser = processOAuth2User(oAuth2UserRequest, oAuth2User);
            
            LoggingUtil.logBusinessEvent(logger, "OAuth2 user loaded successfully", "provider", oAuth2UserRequest.getClientRegistration().getRegistrationId());
            return processedUser;
        } catch (Exception e) {
            LoggingUtil.logServiceWarning(logger, "Failed to load OAuth2 user", "provider", oAuth2UserRequest.getClientRegistration().getRegistrationId(), "Error", e.getMessage());
            throw e;
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        LoggingUtil.logServiceDebug(logger, "Processing OAuth2 user", "provider", oAuth2UserRequest.getClientRegistration().getRegistrationId());
        
        Oauth2UserInfoDto userInfoDto = Oauth2UserInfoDto
                .builder()
                .name(oAuth2User.getAttributes().get("name").toString())
                .id(oAuth2User.getAttributes().get("sub").toString())
                .email(oAuth2User.getAttributes().get("email").toString())
                .picture(oAuth2User.getAttributes().get("picture").toString())
                .build();

        LoggingUtil.logServiceDebug(logger, "OAuth2 user info extracted", "email", userInfoDto.getEmail(), "name", userInfoDto.getName());

        Optional<User> userOptional = userRepository.findByUsername(userInfoDto.getEmail());
        User user = userOptional
                .map(existingUser -> updateExistingUser(existingUser, userInfoDto))
                .orElseGet(() -> registerNewUser(oAuth2UserRequest, userInfoDto));
        
        LoggingUtil.logBusinessEvent(logger, "OAuth2 user processed", "userId", user.getId(), "username", user.getUsername());
        return UserPrincipal.create(user, oAuth2User.getAttributes());
    }

    private User registerNewUser(OAuth2UserRequest oAuth2UserRequest, Oauth2UserInfoDto userInfoDto) {
        LoggingUtil.logBusinessEvent(logger, "Registering new OAuth2 user", "email", userInfoDto.getEmail(), "provider", oAuth2UserRequest.getClientRegistration().getRegistrationId());
        
        User user = User.builder()
            .provider(oAuth2UserRequest.getClientRegistration().getRegistrationId())
            .providerId(userInfoDto.getId())
            .name(userInfoDto.getName())
            .username(userInfoDto.getEmail())
            .picture(userInfoDto.getPicture())
            .enabled(true)
            .accountNonExpired(true)
            .accountNonLocked(true)
            .credentialsNonExpired(true)
            .build();
        
        User savedUser = userRepository.save(user);
        LoggingUtil.logBusinessEvent(logger, "New OAuth2 user registered successfully", "userId", savedUser.getId(), "username", savedUser.getUsername());
        return savedUser;
    }

    private User updateExistingUser(User existingUser, Oauth2UserInfoDto userInfoDto) {
        LoggingUtil.logBusinessEvent(logger, "Updating existing OAuth2 user", "userId", existingUser.getId(), "username", existingUser.getUsername());
        
        existingUser.setName(userInfoDto.getName());
        existingUser.setPicture(userInfoDto.getPicture());
        
        User updatedUser = userRepository.save(existingUser);
        LoggingUtil.logBusinessEvent(logger, "Existing OAuth2 user updated successfully", "userId", updatedUser.getId(), "username", updatedUser.getUsername());
        return updatedUser;
    }
}
