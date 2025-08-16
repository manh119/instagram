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
            String requestURI = request.getRequestURI();
            String method = request.getMethod();

            LoggingUtil.logServiceDebug(logger, "JWT Filter Processing", 
                "Request URI", requestURI,
                "Method", method,
                "Has JWT", jwt != null);

            if (StringUtils.hasText(jwt)) {
                LoggingUtil.logServiceDebug(logger, "JWT Token found", 
                    "Token length", jwt.length(),
                    "Token start", jwt.substring(0, Math.min(20, jwt.length())) + "...");
                
                if (jwtTokenUtil.validateToken(jwt)) {
                    String username = jwtTokenUtil.extractUsername(jwt);
                    LoggingUtil.logServiceDebug(logger, "JWT Token validated", 
                        "Username", username,
                        "Request URI", requestURI);
                    
                    try {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        LoggingUtil.logServiceDebug(logger, "User details loaded", 
                            "Username", userDetails.getUsername(),
                            "Authorities", userDetails.getAuthorities().size());
                        
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        LoggingUtil.logServiceDebug(logger, "Authentication set in security context", 
                            "Username", username,
                            "Request URI", requestURI);
                    } catch (Exception e) {
                        LoggingUtil.logServiceWarning(logger, "Error loading user details", 
                            "Username", username,
                            "Request URI", requestURI,
                            "Error", e.getMessage());
                        logger.error("Could not load user details for request: " + requestURI, e);
                    }
                } else {
                    LoggingUtil.logServiceWarning(logger, "JWT Token validation failed", 
                        "Request URI", requestURI,
                        "Method", method);
                }
            } else {
                LoggingUtil.logServiceDebug(logger, "No JWT token found in request", 
                    "Request URI", requestURI,
                    "Method", method,
                    "Headers", getRequestHeaders(request));
            }
        } catch (Exception ex) {
            LoggingUtil.logServiceWarning(logger, "JWT Filter error", 
                "Request URI", request.getRequestURI(),
                "Method", request.getMethod(),
                "Error", ex.getMessage());
            logger.error("Could not set user authentication in security context for request: " + request.getRequestURI(), ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        LoggingUtil.logServiceDebug(logger, "Extracting JWT from request", 
            "Authorization header", bearerToken != null ? "present" : "missing",
            "Header value", bearerToken != null ? bearerToken.substring(0, Math.min(30, bearerToken.length())) + "..." : "null");
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private String getRequestHeaders(HttpServletRequest request) {
        StringBuilder headers = new StringBuilder();
        java.util.Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            String headerValue = request.getHeader(headerName);
            headers.append(headerName).append(": ").append(headerValue).append(", ");
        }
        return headers.toString();
    }
}

