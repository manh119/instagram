package com.engineerpro.example.redis.security;

import com.engineerpro.example.redis.service.CustomUserDetailsService;
import com.engineerpro.example.redis.util.LoggingUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
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

    private static final Logger logger = LoggingUtil.getLogger(JwtAuthenticationFilter.class);

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
                LoggingUtil.logServiceDebug(logger, "JWT Filter Processing", "Request URI", request.getRequestURI());
                
                if (jwtTokenUtil.validateToken(jwt)) {
                    String username = jwtTokenUtil.extractUsername(jwt);
                    LoggingUtil.logServiceDebug(logger, "JWT Token validated", "Username", username);
                    
                    try {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        LoggingUtil.logServiceDebug(logger, "User details loaded", "Username", userDetails.getUsername());
                        
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        LoggingUtil.logServiceDebug(logger, "Authentication set in security context", "Username", username);
                    } catch (Exception e) {
                        LoggingUtil.logServiceWarning(logger, "Error loading user details", "Username", username, "Error", e.getMessage());
                        logger.error("Could not load user details", e);
                    }
                } else {
                    LoggingUtil.logServiceWarning(logger, "JWT Token validation failed", "Request URI", request.getRequestURI());
                }
            } else {
                LoggingUtil.logServiceDebug(logger, "No JWT token found in request", "Request URI", request.getRequestURI());
            }
        } catch (Exception ex) {
            LoggingUtil.logServiceWarning(logger, "JWT Filter error", "Request URI", request.getRequestURI(), "Error", ex.getMessage());
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

