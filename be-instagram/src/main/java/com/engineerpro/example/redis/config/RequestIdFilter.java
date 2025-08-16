package com.engineerpro.example.redis.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(1)
public class RequestIdFilter implements Filter {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String REQUEST_ID_MDC_KEY = "requestId";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Generate or extract request ID
        String requestId = extractOrGenerateRequestId(httpRequest);
        
        // Set in MDC for logging
        MDC.put(REQUEST_ID_MDC_KEY, requestId);
        
        // Add to response headers
        httpResponse.addHeader(REQUEST_ID_HEADER, requestId);
        
        try {
            chain.doFilter(request, response);
        } finally {
            // Clean up MDC
            MDC.remove(REQUEST_ID_MDC_KEY);
        }
    }

    private String extractOrGenerateRequestId(HttpServletRequest request) {
        // Check if request ID is already provided in headers
        String existingRequestId = request.getHeader(REQUEST_ID_HEADER);
        if (existingRequestId != null && !existingRequestId.trim().isEmpty()) {
            return existingRequestId;
        }
        
        // Generate new request ID
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}

