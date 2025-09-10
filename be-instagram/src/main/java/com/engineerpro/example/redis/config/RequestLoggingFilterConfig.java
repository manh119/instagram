package com.engineerpro.example.redis.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.CommonsRequestLoggingFilter;
import org.springframework.web.util.UrlPathHelper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Configuration
public class RequestLoggingFilterConfig {
  
  @Bean
  public CommonsRequestLoggingFilter logFilter() {
    return new WebSocketAwareRequestLoggingFilter();
  }
  
  /**
   * Custom request logging filter that excludes WebSocket endpoints
   */
  public static class WebSocketAwareRequestLoggingFilter extends CommonsRequestLoggingFilter {
    
    private final UrlPathHelper urlPathHelper = new UrlPathHelper();
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
      
      String requestPath = urlPathHelper.getPathWithinApplication(request);
      
      // Skip logging for WebSocket endpoints to reduce noise
      if (isWebSocketEndpoint(requestPath)) {
        filterChain.doFilter(request, response);
        return;
      }
      
      // Log other requests normally
      super.doFilterInternal(request, response, filterChain);
    }
    
    private boolean isWebSocketEndpoint(String path) {
      return path != null && (
        path.startsWith("/api/ws") ||
        path.startsWith("/ws") ||
        path.contains("websocket") ||
        path.contains("sockjs")
      );
    }
    
    @Override
    protected void beforeRequest(HttpServletRequest request, String message) {
      // Only log if it's not a WebSocket endpoint
      if (!isWebSocketEndpoint(urlPathHelper.getPathWithinApplication(request))) {
        super.beforeRequest(request, message);
      }
    }
    
    @Override
    protected void afterRequest(HttpServletRequest request, String message) {
      // Only log if it's not a WebSocket endpoint
      if (!isWebSocketEndpoint(urlPathHelper.getPathWithinApplication(request))) {
        super.afterRequest(request, message);
      }
    }
  }
}
