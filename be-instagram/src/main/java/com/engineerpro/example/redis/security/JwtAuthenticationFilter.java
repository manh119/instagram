package com.engineerpro.example.redis.security;

import com.engineerpro.example.redis.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt)) {
                System.out.println("=== JWT Filter Processing ===");
                System.out.println("JWT Token: " + jwt);
                System.out.println("Request URI: " + request.getRequestURI());
                
                if (jwtTokenUtil.validateToken(jwt)) {
                    String username = jwtTokenUtil.extractUsername(jwt);
                    System.out.println("JWT Token valid, username: " + username);
                    
                    try {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        System.out.println("User details loaded successfully: " + userDetails.getUsername());
                        
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        System.out.println("Authentication set in security context");
                    } catch (Exception e) {
                        System.out.println("Error loading user details: " + e.getMessage());
                        e.printStackTrace();
                    }
                } else {
                    System.out.println("JWT Token validation failed");
                }
            } else {
                System.out.println("No JWT token found in request");
            }
        } catch (Exception ex) {
            System.out.println("JWT Filter error: " + ex.getMessage());
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

