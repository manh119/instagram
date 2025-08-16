package com.engineerpro.example.redis.security;

import com.engineerpro.example.redis.model.User;
import com.engineerpro.example.redis.config.SecurityConfig;
import com.engineerpro.example.redis.model.Profile;
import com.engineerpro.example.redis.repository.UserRepository;
import com.engineerpro.example.redis.repository.ProfileRepository;
import com.engineerpro.example.redis.security.JwtTokenUtil;
import com.engineerpro.example.redis.util.LoggingUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger logger = LoggingUtil.getLogger(OAuth2AuthenticationSuccessHandler.class);

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth2/redirect}")
    private String redirectUri;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                     Authentication authentication) throws IOException, ServletException {
        
        if (authentication.getPrincipal() instanceof SecurityConfig.CustomOAuth2User) {
            SecurityConfig.CustomOAuth2User oauth2User = (SecurityConfig.CustomOAuth2User) authentication.getPrincipal();
            
            // Log OAuth2 user details
            LoggingUtil.logBusinessEvent(logger, "OAuth2 Authentication Success", 
                "Email", oauth2User.getEmail(),
                "Provider", oauth2User.getProvider(),
                "Provider ID", oauth2User.getProviderId(),
                "Display Name", oauth2User.getDisplayName());
            
            // Process OAuth2 user and create/update user in database
            User user = processOAuth2User(oauth2User);
            
            // Log processed user details
            LoggingUtil.logBusinessEvent(logger, "User Processed Successfully", 
                "User ID", user.getId(),
                "Username", user.getUsername(),
                "Name", user.getName(),
                "Provider", user.getProvider(),
                "Provider ID", user.getProviderId(),
                "Enabled", user.isEnabled());
            
            // Generate JWT token
            String token = jwtTokenUtil.generateToken(user.getUsername(), oauth2User.getProvider(), oauth2User.getProviderId());
            
            // Log JWT token details (without exposing the actual token)
            LoggingUtil.logServiceDebug(logger, "JWT Token Generated", 
                "Username", user.getUsername(),
                "Token Length", token.length());
            
            // Redirect to frontend with token
            String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                    .queryParam("token", token)
                    .queryParam("username", user.getUsername())
                    .queryParam("provider", oauth2User.getProvider())
                    .build().toUriString();
            
            LoggingUtil.logServiceDebug(logger, "Redirecting to Frontend", "Target URL", targetUrl);
            
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } else {
            LoggingUtil.logServiceWarning(logger, "OAuth2 Authentication Failed", 
                "Principal Type", authentication.getPrincipal() != null ? authentication.getPrincipal().getClass().getName() : "null");
            super.onAuthenticationSuccess(request, response, authentication);
        }
    }

    private User processOAuth2User(SecurityConfig.CustomOAuth2User oauth2User) {
        String email = oauth2User.getEmail();
        String provider = oauth2User.getProvider();
        String providerId = oauth2User.getProviderId();
        
        LoggingUtil.logServiceDebug(logger, "Processing OAuth2 User", 
            "Email", email,
            "Provider", provider,
            "Provider ID", providerId);
        
        // Check if user already exists
        Optional<User> existingUser = userRepository.findByProviderAndProviderId(provider, providerId);
        
        if (existingUser.isPresent()) {
            // Update existing user
            LoggingUtil.logBusinessEvent(logger, "Updating Existing User", 
                "User ID", existingUser.get().getId(),
                "Username", existingUser.get().getUsername());
            
            User user = existingUser.get();
            
            user.setName(oauth2User.getDisplayName());
            user.setPicture(oauth2User.getPicture());
            user.setEnabled(true);
            
            User savedUser = userRepository.save(user);
            LoggingUtil.logBusinessEvent(logger, "User Updated Successfully", "User ID", savedUser.getId());
            return savedUser;
        } else {
            // Create new user
            LoggingUtil.logBusinessEvent(logger, "Creating New User", 
                "Email", email,
                "Provider", provider);
            
            User newUser = new User();
            newUser.setId(UUID.randomUUID());
            newUser.setUsername(email); // Use email as username
            newUser.setName(oauth2User.getDisplayName());
            newUser.setPicture(oauth2User.getPicture());
            newUser.setProvider(provider);
            newUser.setProviderId(providerId);
            newUser.setEnabled(true);
            newUser.setAccountNonExpired(true);
            newUser.setAccountNonLocked(true);
            newUser.setCredentialsNonExpired(true);
            
            LoggingUtil.logServiceDebug(logger, "New User Details", 
                "ID", newUser.getId(),
                "Username", newUser.getUsername(),
                "Name", newUser.getName(),
                "Provider", newUser.getProvider(),
                "Provider ID", newUser.getProviderId());
            
            User savedUser = userRepository.save(newUser);
            LoggingUtil.logBusinessEvent(logger, "New User Created Successfully", "User ID", savedUser.getId());
            
            // Create profile for new user
            Profile profile = Profile.builder()
                    .userId(savedUser.getId().toString())
                    .username(email)
                    .displayName(oauth2User.getDisplayName())
                    .profileImageUrl(oauth2User.getPicture())
                    .build();
            
            profileRepository.save(profile);
            LoggingUtil.logBusinessEvent(logger, "Profile Created Successfully", "User ID", savedUser.getId());
            
            return savedUser;
        }
    }
}

