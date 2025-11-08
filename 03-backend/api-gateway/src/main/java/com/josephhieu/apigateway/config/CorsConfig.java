package com.josephhieu.apigateway.config; // Thay bằng package của bạn

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {

        final CorsConfiguration corsConfig = new CorsConfiguration();

        // 1. Cho phép request từ 3 cổng frontend của bạn
        corsConfig.setAllowedOrigins(Arrays.asList(
                "http://localhost:5174", // admin-web
                "http://localhost:3000" // client-web
        ));

        // 2. Cho phép tất cả các phương thức (POST, GET, PUT...)
        corsConfig.addAllowedMethod("*");

        // 3. Cho phép tất cả các header (bao gồm 'Authorization' để gửi JWT)
        corsConfig.addAllowedHeader("*");

        // 4. Cho phép gửi cookie/auth
        corsConfig.setAllowCredentials(true);
        corsConfig.setMaxAge(3600L); // Cache trong 1 giờ

        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig); // Áp dụng cho TẤT CẢ các route

        return new CorsWebFilter(source);
    }
}