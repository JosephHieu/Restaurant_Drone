package com.josephhieu.userservice.controller;

import com.josephhieu.userservice.dto.request.AdminCreateUserRequest; // <-- DTO MỚI
import com.josephhieu.userservice.dto.request.AdminUpdateUserRequest;
import com.josephhieu.userservice.dto.request.UpdateProfileRequest;
import com.josephhieu.userservice.entity.User;
import com.josephhieu.userservice.exception.ResourceNotFoundException; // Cần import
import com.josephhieu.userservice.security.CustomUserDetails;
import com.josephhieu.userservice.service.UserService; // <-- SERVICE MỚI
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    // 1. Chỉ inject MỘT service
    @Autowired
    private UserService userService;

    // (Xóa @Autowired UserRepository)
    // (Xóa @Autowired AuthService)

    // API /api/users/me (Gọi UserService)
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUserProfile(@AuthenticationPrincipal CustomUserDetails currentUser) {
        User user = userService.getUserProfile(currentUser.getId());
        return ResponseEntity.ok(user);
    }

    // API GET /api/users (Gọi UserService)
    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // API POST /api/users (Gọi UserService)
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody AdminCreateUserRequest request) {
        userService.createUserByAdmin(request);
        return ResponseEntity.ok("User created successfully by Admin.");
    }

    // API DELETE /api/users/{id} (Gọi UserService)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully.");
    }

    /**
     * API Lấy 1 user theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * API Cập nhật 1 user
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @Valid @RequestBody AdminUpdateUserRequest request) {
        userService.updateUser(id, request);
        return ResponseEntity.ok("User updated successfully.");
    }

    /**
     * API cho user tự cập nhật thông tin (Họ tên, SĐT, Địa chỉ)
     */
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()") // Yêu cầu đăng nhập
    public ResponseEntity<User> updateUserProfile(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {

        User updatedUser = userService.updateUserProfile(currentUser.getId(), request);
        return ResponseEntity.ok(updatedUser);
    }
}