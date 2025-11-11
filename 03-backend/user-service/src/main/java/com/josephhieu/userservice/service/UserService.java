package com.josephhieu.userservice.service;

import com.josephhieu.userservice.client.RestaurantClient;
import com.josephhieu.userservice.dto.request.AdminCreateUserRequest;
import com.josephhieu.userservice.dto.request.AdminUpdateUserRequest;
import com.josephhieu.userservice.dto.request.UpdateProfileRequest;
import com.josephhieu.userservice.entity.Cart;
import com.josephhieu.userservice.entity.Role;
import com.josephhieu.userservice.entity.User;
import com.josephhieu.userservice.exception.ResourceNotFoundException;
import com.josephhieu.userservice.repository.CartRepository;
import com.josephhieu.userservice.repository.RoleRepository;
import com.josephhieu.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RestaurantClient  restaurantClient; // <-- Tiêm (Inject) Feign Client

    /**
     * Dùng cho API: GET /api/users/me
     */
    public User getUserProfile(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    /**
     * API: PUT /api/users/me
     * Xử lý logic cho user tự cập nhật thông tin
     */
    @Transactional
    public User updateUserProfile(Integer userId, UpdateProfileRequest request) {
        // 1. Tìm user
        User user = getUserById(userId); // Dùng lại hàm cũ

        // 2. Kiểm tra SĐT trùng (nếu SĐT bị thay đổi)
        // (Bỏ qua nếu SĐT mới giống hệt SĐT cũ)
        if (!user.getPhone().equals(request.getPhone())) {
            if (userRepository.existsByPhone(request.getPhone())) {
                throw new IllegalStateException("Lỗi: Số điện thoại này đã được đăng ký.");
            }
        }

        // 3. Cập nhật các trường
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());

        return userRepository.save(user);
    }

    /**
     * Dùng cho API: GET /api/users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Dùng cho API: POST /api/users
     * (Logic này khác với AuthService.register vì nó nhận roleId)
     */
    @Transactional
    public User createUserByAdmin(AdminCreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStatus("active");

        // Admin chọn vai trò (ví dụ: roleId=1 là ADMIN)
        Role userRole = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", request.getRoleId()));
        user.setRole(userRole);

        User savedUser = userRepository.save(user);

        // Tạo giỏ hàng rỗng cho user
        Cart cart = new Cart();
        cart.setUser(savedUser);
        cartRepository.save(cart);

        return savedUser;
    }

    /**
     * Dùng cho API: DELETE /api/users/{id}
     */
    @Transactional
    public void deleteUser(Integer id) {
        // Lấy token "Bearer ..." từ request của Admin
        String token = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes())
                .getRequest().getHeader("Authorization");

        // Gọi API sang restaurant-service
        boolean ownsRestaurant = restaurantClient.checkUserOwnership(id, token);

        if (ownsRestaurant) {
            // Nếu là chủ, từ chối xóa
            throw new IllegalStateException(
                    "Không thể xóa user. Người này vẫn đang sở hữu nhà hàng."
            );
        }
        // ===============================

        // Tìm và xóa CART
        Optional<Cart> cart = cartRepository.findByUser_UserId(id);
        cart.ifPresent(cartRepository::delete);

        // Xóa USER
        userRepository.deleteById(id);
    }

    /**
     * Dùng cho API: GET /api/users/{id}
     * Lấy thông tin của 1 user để đưa vào form Sửa
     */
    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    /**
     * Dùng cho API: PUT /api/users/{id}
     * Cập nhật thông tin user
     */
    @Transactional
    public User updateUser(Integer id, AdminUpdateUserRequest request) {
        // 1. Tìm user hiện tại
        User user = getUserById(id);

        // 2. Kiểm tra xem email mới có bị trùng với user khác không
        Optional<User> userByEmail = userRepository.findByEmail(request.getEmail());
        if (userByEmail.isPresent() && !userByEmail.get().getUserId().equals(id)) {
            throw new RuntimeException("Error: Email is already in use by another account!");
        }

        // 3. Tìm vai trò (role)
        Role userRole = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", request.getRoleId()));

        // 4. Cập nhật các trường
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setStatus(request.getStatus());
        user.setRole(userRole);

        // 5. Lưu lại
        return userRepository.save(user);
    }
}