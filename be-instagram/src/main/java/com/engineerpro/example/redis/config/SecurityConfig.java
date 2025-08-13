package com.engineerpro.example.redis.config;

import com.engineerpro.example.redis.security.JwtAuthenticationFilter;
import com.engineerpro.example.redis.security.JwtAuthenticationEntryPoint;
import com.engineerpro.example.redis.security.OAuth2AuthenticationSuccessHandler;
import com.engineerpro.example.redis.security.OAuth2AuthenticationFailureHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    @Autowired
    private OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/auth/**", "/oauth2/**", "/api-docs/**", "/swagger-ui/**", "/actuator/health").permitAll()
                .requestMatchers("/posts/**", "/profiles/**", "/feed/**").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(auth -> auth
                    .baseUri("/oauth2/authorize")
                )
                .redirectionEndpoint(redirect -> redirect
                    .baseUri("/oauth2/callback/*")
                )
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(oauth2UserService())
                )
                .successHandler(oAuth2AuthenticationSuccessHandler)
                .failureHandler(oAuth2AuthenticationFailureHandler)
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService() {
        DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
        
        return userRequest -> {
            OAuth2User oauth2User = delegate.loadUser(userRequest);
            
            // Extract user information from OAuth2 response
            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");
            String picture = oauth2User.getAttribute("picture");
            String provider = userRequest.getClientRegistration().getRegistrationId();
            String providerId = oauth2User.getAttribute("sub");
            
            // Create custom OAuth2User with additional attributes
            return new CustomOAuth2User(oauth2User, email, name, picture, provider, providerId);
        };
    }

    // Custom OAuth2User implementation
    public static class CustomOAuth2User implements OAuth2User {
        private final OAuth2User oauth2User;
        private final String email;
        private final String name;
        private final String picture;
        private final String provider;
        private final String providerId;

        public CustomOAuth2User(OAuth2User oauth2User, String email, String name, String picture, String provider, String providerId) {
            this.oauth2User = oauth2User;
            this.email = email;
            this.name = name;
            this.picture = picture;
            this.provider = provider;
            this.providerId = providerId;
        }

        @Override
        public java.util.Map<String, Object> getAttributes() {
            return oauth2User.getAttributes();
        }

        @Override
        public java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> getAuthorities() {
            return oauth2User.getAuthorities();
        }

        @Override
        public String getName() {
            return oauth2User.getName();
        }

        public String getEmail() { return email; }
        public String getDisplayName() { return name; }
        public String getPicture() { return picture; }
        public String getProvider() { return provider; }
        public String getProviderId() { return providerId; }
    }
}
