package com.engineerpro.example.redis.security;

import com.engineerpro.example.redis.model.User;
import com.engineerpro.example.redis.config.SecurityConfig;
import com.engineerpro.example.redis.model.Profile;
import com.engineerpro.example.redis.repository.UserRepository;
import com.engineerpro.example.redis.repository.ProfileRepository;
import com.engineerpro.example.redis.security.JwtTokenUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
            System.out.println("=== OAuth2 Authentication Success ===");
            System.out.println("Email: " + oauth2User.getEmail());
            System.out.println("Provider: " + oauth2User.getProvider());
            System.out.println("Provider ID: " + oauth2User.getProviderId());
            System.out.println("Display Name: " + oauth2User.getDisplayName());
            
            // Process OAuth2 user and create/update user in database
            User user = processOAuth2User(oauth2User);
            
            // Log processed user details
            System.out.println("=== Processed User ===");
            System.out.println("User ID: " + user.getId());
            System.out.println("Username: " + user.getUsername());
            System.out.println("Name: " + user.getName());
            System.out.println("Provider: " + user.getProvider());
            System.out.println("Provider ID: " + user.getProviderId());
            System.out.println("Enabled: " + user.isEnabled());
            
            // Generate JWT token
            String token = jwtTokenUtil.generateToken(user.getUsername(), oauth2User.getProvider(), oauth2User.getProviderId());
            
            // Log JWT token details
            System.out.println("=== JWT Token ===");
            System.out.println("Token: " + token);
            System.out.println("Username in token: " + user.getUsername());
            
            // Redirect to frontend with token
            String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                    .queryParam("token", token)
                    .queryParam("username", user.getUsername())
                    .queryParam("provider", oauth2User.getProvider())
                    .build().toUriString();
            
            System.out.println("=== Redirect URL ===");
            System.out.println("Target URL: " + targetUrl);
            
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } else {
            System.out.println("=== OAuth2 Authentication Failed ===");
            System.out.println("Principal type: " + (authentication.getPrincipal() != null ? authentication.getPrincipal().getClass().getName() : "null"));
            super.onAuthenticationSuccess(request, response, authentication);
        }
    }

    private User processOAuth2User(SecurityConfig.CustomOAuth2User oauth2User) {
        String email = oauth2User.getEmail();
        String provider = oauth2User.getProvider();
        String providerId = oauth2User.getProviderId();
        
        System.out.println("=== Processing OAuth2 User ===");
        System.out.println("Email: " + email);
        System.out.println("Provider: " + provider);
        System.out.println("Provider ID: " + providerId);
        
        // Check if user already exists
        Optional<User> existingUser = userRepository.findByProviderAndProviderId(provider, providerId);
        
        if (existingUser.isPresent()) {
            // Update existing user
            System.out.println("=== Updating Existing User ===");
            User user = existingUser.get();
            System.out.println("Existing User ID: " + user.getId());
            System.out.println("Existing Username: " + user.getUsername());
            
            user.setName(oauth2User.getDisplayName());
            user.setPicture(oauth2User.getPicture());
            user.setEnabled(true);
            
            User savedUser = userRepository.save(user);
            System.out.println("Updated User saved successfully");
            return savedUser;
        } else {
            // Create new user
            System.out.println("=== Creating New User ===");
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
            
            System.out.println("New User details:");
            System.out.println("  ID: " + newUser.getId());
            System.out.println("  Username: " + newUser.getUsername());
            System.out.println("  Name: " + newUser.getName());
            System.out.println("  Provider: " + newUser.getProvider());
            System.out.println("  Provider ID: " + newUser.getProviderId());
            
            User savedUser = userRepository.save(newUser);
            System.out.println("New User saved successfully with ID: " + savedUser.getId());
            
            // Create profile for new user
            Profile profile = Profile.builder()
                    .userId(savedUser.getId().toString())
                    .username(email)
                    .displayName(oauth2User.getDisplayName())
                    .profileImageUrl(oauth2User.getPicture())
                    .build();
            
            profileRepository.save(profile);
            System.out.println("Profile created successfully");
            
            return savedUser;
        }
    }
}

