package com.craftresourcemanagement.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class ServiceAuthenticationFilter extends OncePerRequestFilter {

    @Value("${service.auth.token:default-service-token-change-in-production}")
    private String serviceAuthToken;

    @Value("${service.auth.enabled:true}")
    private boolean authEnabled;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String path = request.getRequestURI();
        if (!path.startsWith("/system/audit-logs") || request.getMethod().equals("GET")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!authEnabled) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("X-Service-Auth-Token");
        
        if (authHeader == null || !authHeader.equals(serviceAuthToken)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\": \"Unauthorized service access\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
