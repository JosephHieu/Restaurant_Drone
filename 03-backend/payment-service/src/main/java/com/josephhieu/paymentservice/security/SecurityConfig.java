package com.josephhieu.paymentservice.security;

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
@EnableMethodSecurity // Bắt buộc để @PreAuthorize (trong Controller) hoạt động
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

                        // === 1. MỞ CÁC ĐƯỜNG DẪN CÔNG KHAI (PUBLIC) ===

                        // QUAN TRỌNG: Mở API cho VNPay gọi (IPN)
                        .requestMatchers("/api/payments/vnpay-ipn").permitAll()

                        // (Tùy chọn: Mở cả đường dẫn trrả về nếu bạn xử lý ở backend)
                        // .requestMatchers("/api/payments/vnpay-return").permitAll()

                        .requestMatchers("/eureka/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // === 2. TẤT CẢ CÁC API CÒN LẠI ===
                        // (Ví dụ: /api/payments/create-vnpay)
                        // Bắt buộc phải được xác thực (phải có JWT token)
                        .anyRequest().authenticated()
                );

        // Thêm bộ lọc JWT của chúng ta
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}