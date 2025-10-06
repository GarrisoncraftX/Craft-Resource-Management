package com.craftresourcemanagement.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class UserPermissionFilter extends HttpFilter {

    @Override
    protected void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        String userId = request.getHeader("x-user-id");
        String permissionsHeader = request.getHeader("x-permissions");

        if (userId != null && permissionsHeader != null) {
            // Parse permissions JSON array string to list of SimpleGrantedAuthority
            List<SimpleGrantedAuthority> authorities = Arrays.stream(permissionsHeader
                    .replace("[", "")
                    .replace("]", "")
                    .replace("\"", "")
                    .split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(SimpleGrantedAuthority::new)
                    .toList();

            // Create an Authentication token with userId as principal and permissions as authorities
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        if (isMultipartRequest(request)) {
            chain.doFilter(new MultipartAwareHttpServletRequestWrapper(request), response);
        } else {
            chain.doFilter(request, response);
        }
    }

    private boolean isMultipartRequest(HttpServletRequest request) {
        String contentType = request.getContentType();
        return contentType != null && contentType.toLowerCase().startsWith("multipart/");
    }

    private static class MultipartAwareHttpServletRequestWrapper extends jakarta.servlet.http.HttpServletRequestWrapper {
        public MultipartAwareHttpServletRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        @Override
        public String getParameter(String name) {
            return null;
        }

        @Override
        public java.util.Enumeration<String> getParameterNames() {
            return java.util.Collections.emptyEnumeration();
        }

        @Override
        public String[] getParameterValues(String name) {
            return null;
        }

        @Override
        public java.util.Map<String, String[]> getParameterMap() {
            return java.util.Collections.emptyMap();
        }
    }
}
