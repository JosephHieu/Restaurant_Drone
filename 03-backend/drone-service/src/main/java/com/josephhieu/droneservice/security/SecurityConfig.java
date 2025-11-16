package com.josephhieu.droneservice.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint unauthorizedHandler;
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable()) // Tắt Form Login
                .httpBasic(basic -> basic.disable()) // Tắt HTTP Basic
                .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // === 1. QUY TẮC CÔNG KHAI (PUBLIC) ===
                        // (Phải đặt LÊN TRÊN CÙNG)

                        .requestMatchers("/ws/**").permitAll() // <-- Mở cho WebSocket

                        .requestMatchers(HttpMethod.GET, "/api/drones/locations").permitAll() // API public lấy vị trí
                        .requestMatchers("/eureka/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // === 2. QUY TẮC CỦA ADMIN (Protected) ===
                        .requestMatchers("/api/drones/**").hasAuthority("ADMIN")

                        // === 3. API NỘI BỘ (Cho OrderService gọi) ===
                        .requestMatchers("/api/deliveries/**").authenticated()

                        .anyRequest().authenticated()
                );

        // Thêm bộ lọc JWT của chúng ta
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}