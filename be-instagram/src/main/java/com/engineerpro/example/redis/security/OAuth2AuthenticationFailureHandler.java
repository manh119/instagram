package com.engineerpro.example.redis.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.oauth2.redirect-uri:http://localhost:5173/oauth2/redirect}")
    private String redirectUri;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                     AuthenticationException exception) throws IOException, ServletException {
        
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("error", "authentication_failed")
                .queryParam("message", exception.getMessage())
                .build().toUriString();
        
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}

