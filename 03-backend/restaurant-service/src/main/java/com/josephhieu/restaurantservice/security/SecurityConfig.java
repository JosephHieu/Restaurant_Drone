package com.josephhieu.restaurantservice.security;

import jakarta.annotation.PostConstruct;
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

    @PostConstruct
    public void init() {
        System.out.println(">>> SecurityConfig loaded for restaurant-service");
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        System.out.println(">>> SECURITY CONFIG ACTIVE <<<");
        http
                .csrf(csrf -> csrf.disable()) // Tắt CSRF
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedHandler)) // Xử lý lỗi 401
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Không dùng session

                .authorizeHttpRequests(auth -> auth

                        // === THỨ TỰ QUY TẮC RẤT QUAN TRỌNG ===
                        // Đặt các quy tắc "cụ thể" và "cần bảo vệ" lên TRƯỚC

                        // 1. Các API CẦN xác thực (cho Chủ nhà hàng / Admin)
                        .requestMatchers(HttpMethod.GET, "/images/**").permitAll() // <-- Cho phép truy cập vào thư mục ảnh tĩnh
                        .requestMatchers("/api/restaurants/my").authenticated() // API "của tôi"
                        .requestMatchers("/api/restaurants/all").hasAuthority("ADMIN") // <-- API MỚI CỦA ADMIN
                        .requestMatchers("/api/restaurants/owner-check/**").authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/restaurants/**").authenticated() // Tạo nhà hàng
                        .requestMatchers(HttpMethod.PUT, "/api/restaurants/**").authenticated() // Sửa nhà hàng
                        .requestMatchers(HttpMethod.DELETE, "/api/restaurants/**").authenticated() // Xóa nhà hàng

                        .requestMatchers(HttpMethod.POST, "/api/menu-items/**").authenticated() // Thêm món
                        .requestMatchers(HttpMethod.PUT, "/api/menu-items/**").authenticated() // Sửa món
                        .requestMatchers(HttpMethod.DELETE, "/api/menu-items/**").authenticated() // Xóa món

                        // 2. Các API CÔNG KHAI (cho Khách hàng xem)
                        // (Phải đặt SAU các quy tắc bảo vệ ở trên)
                        .requestMatchers(HttpMethod.GET, "/api/restaurants/**").permitAll() // Cho khách xem DS nhà hàng
                        .requestMatchers(HttpMethod.GET, "/api/menu-items/**").permitAll() // Cho khách xem món ăn

                        // 3. Cho phép Eureka
                        .requestMatchers("/eureka/**").permitAll()

                        // 4. Mọi thứ khác
                        .anyRequest().authenticated()
                );


        // Thêm bộ lọc JWT của chúng ta vào trước bộ lọc username/password
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}