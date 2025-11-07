package com.josephhieu.userservice.service;

import com.josephhieu.userservice.dto.request.LoginRequest;
import com.josephhieu.userservice.dto.request.RegisterRequest;
import com.josephhieu.userservice.entity.Cart;
import com.josephhieu.userservice.entity.Role;
import com.josephhieu.userservice.entity.User;
import com.josephhieu.userservice.exception.ResourceNotFoundException;
import com.josephhieu.userservice.repository.CartRepository;
import com.josephhieu.userservice.repository.RoleRepository;
import com.josephhieu.userservice.repository.UserRepository;
import com.josephhieu.userservice.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtTokenProvider tokenProvider;

    public String login(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            return tokenProvider.generateToken(authentication);
        } catch (DisabledException ex) {
            // === BẮT LỖI 1: TÀI KHOẢN BỊ CẤM/VÔ HIỆU HÓA ===
            throw new IllegalStateException("Tài khoản này đã bị cấm hoặc chưa được kích hoạt.", ex);
        } catch (Exception ex) {
            // Bắt các lỗi chung khác (sai mật khẩu, user không tồn tại)
            throw new RuntimeException("Tên đăng nhập hoặc mật khẩu không chính xác.", ex);
        }
    }

    @Transactional
    public User register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = new User();
        user.setFullName(registerRequest.getFullName());
        user.setEmail(registerRequest.getEmail());
        user.setPhone(registerRequest.getPhone());
        user.setPasswordHash(passwordEncoder.encode(registerRequest.getPassword()));
        user.setStatus("active");

        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", "USER"));
        user.setRole(userRole);

        User savedUser = userRepository.save(user);

        Cart cart = new Cart();
        cart.setUser(savedUser);
        cartRepository.save(cart);

        return savedUser;
    }
}