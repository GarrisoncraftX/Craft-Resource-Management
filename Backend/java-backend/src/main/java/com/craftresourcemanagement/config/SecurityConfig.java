package com.craftresourcemanagement.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    private final UserPermissionFilter userPermissionFilter;

    public SecurityConfig(UserPermissionFilter userPermissionFilter) {
        this.userPermissionFilter = userPermissionFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**", "/api/lookup/**", "/hr/employees/list").permitAll()
                .requestMatchers("/finance/accounts/**").hasAuthority("finance.view_dashboard")
                .anyRequest().authenticated()
            )
            .addFilterBefore(userPermissionFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
            .httpBasic().disable()
            .formLogin().disable();

        return http.build();
    }
}
