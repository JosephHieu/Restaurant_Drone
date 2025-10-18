package com.josephhieu.userservice.service;

import com.josephhieu.userservice.dto.request.UserCreationRequest;
import com.josephhieu.userservice.dto.request.UserUpdateRequest;
import com.josephhieu.userservice.dto.response.UserResponse;
import com.josephhieu.userservice.entity.User;
import com.josephhieu.userservice.repository.RoleRepository;
import com.josephhieu.userservice.repository.UserRepository;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Builder
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(String id) {

        var user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        return mapToResponse(user);
    }

    @Override
    public UserResponse createUser(UserCreationRequest request) {

        // Kiểm tra roleId hợp lệ
        var role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role Not found with id: " + request.getRoleId()));

        // Tạo user bằng Builder
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .address(request.getAddress())
                .status(request.getStatus() != null ? request.getStatus() : com.josephhieu.userservice.entity.Status.active)
                .role(role)
                .build();

        // Lưu vào DB và trả về DTO
        return mapToResponse(userRepository.save(user));
    }

    @Override
    public UserResponse updateUser(String id, UserUpdateRequest request) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getStatus() != null) user.setStatus(request.getStatus());

        if (request.getRoleId() != null) {
            var role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role not found with id: " + request.getRoleId()));
            user.setRole(role);
        }

        return mapToResponse(userRepository.save(user));
    }

    @Override
    public void deleteUserById(String id) {

        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    // Hàm dùng để chuyển từ User -> UserResponse
    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .status(user.getStatus())
                .roleName(user.getRole() != null ? user.getRole().getName() : null)
                .build();
    }
}
