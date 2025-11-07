package com.josephhieu.restaurantservice.controller;

import com.josephhieu.restaurantservice.dto.request.*;
import com.josephhieu.restaurantservice.entity.MenuItem;
import com.josephhieu.restaurantservice.entity.Restaurant;
import com.josephhieu.restaurantservice.security.CustomUserDetails;
import com.josephhieu.restaurantservice.service.FileStorageService;
import com.josephhieu.restaurantservice.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * API cho chủ nhà hàng lấy thông tin quán CỦA MÌNH
     */
    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESTAURANT_OWNER')")
    public ResponseEntity<Restaurant> getMyRestaurant(
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(restaurantService.getMyRestaurant(user));
    }

    /**
     * API cho chủ nhà hàng cập nhật thông tin quán CỦA MÌNH
     */
    @PutMapping("/my")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESTAURANT_OWNER')")
    public ResponseEntity<Restaurant> updateMyRestaurant(
            @Valid @RequestBody UpdateRestaurantRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        Restaurant updatedRestaurant = restaurantService.updateMyRestaurant(user, request);
        return ResponseEntity.ok(updatedRestaurant);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('RESTAURANT_OWNER')") // <-- CHỈ OWNER DÙNG API NÀY
    public ResponseEntity<Restaurant> ownerUpdateRestaurant(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateRestaurantRequest request, // <-- DTO cho Owner (ít trường hơn Admin)
            @AuthenticationPrincipal CustomUserDetails user) {

        Restaurant updatedRestaurant = restaurantService.ownerUpdateRestaurant(id, request, user);
        return ResponseEntity.ok(updatedRestaurant);
    }

    /**
     * API cho Chủ nhà hàng lấy TẤT CẢ nhà hàng họ sở hữu
     */
    @GetMapping("/my/all")
    @PreAuthorize("hasAuthority('RESTAURANT_OWNER')")
    public ResponseEntity<List<Restaurant>> getMyAllRestaurants(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer ownerId = userDetails.getId(); // <-- Dùng ID trực tiếp từ Principal
        List<Restaurant> restaurants = restaurantService.getAllRestaurantsByOwnerId(ownerId);
        return ResponseEntity.ok(restaurants);
    }

    // HÀM MỚI: API cho các service nội bộ gọi
    @GetMapping("/owner-check/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Boolean> checkUserOwnership(@PathVariable Integer userId) {
        // API này trả về true (nếu user là chủ) hoặc false (nếu không)
        return ResponseEntity.ok(restaurantService.checkUserOwnership(userId));
    }

    // === API PUBLIC ===

    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllOpenRestaurants() {
        return ResponseEntity.ok(restaurantService.getAllOpenRestaurants());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable Integer id) {
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }

    @GetMapping("/{id}/menu")
    public ResponseEntity<List<MenuItem>> getMenuForRestaurant(@PathVariable Integer id) {
        return ResponseEntity.ok(restaurantService.getMenuItemsByRestaurant(id));
    }

    // === API PROTECTED (CẦN ĐĂNG NHẬP) ===

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESTAURANT_OWNER')")
    public ResponseEntity<Restaurant> createRestaurant(
            @Valid @RequestBody CreateRestaurantRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        Restaurant newRestaurant = restaurantService.createRestaurant(request, user);
        return ResponseEntity.status(201).body(newRestaurant);
    }

    @PostMapping("/{id}/menu-items")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESTAURANT_OWNER')")
    public ResponseEntity<MenuItem> createMenuItem(
            @PathVariable("id") Integer restaurantId,
            @Valid @RequestBody CreateMenuItemRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        MenuItem newItem = restaurantService.createMenuItem(restaurantId, request, user);
        return ResponseEntity.status(201).body(newItem);
    }

    /**
     * API cho Admin lấy TẤT CẢ nhà hàng
     */
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        List<Restaurant> restaurants = restaurantService.getAllRestaurantsForAdmin();
        return ResponseEntity.ok(restaurants);
    }

    /**
     * API cho Admin Phê duyệt (Chấp thuận) một nhà hàng
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Restaurant> approveRestaurant(@PathVariable Integer id) {
        Restaurant updatedRestaurant = restaurantService.approveRestaurant(id);
        return ResponseEntity.ok(updatedRestaurant);
    }

    /**
     * API chung cho Admin cập nhật trạng thái (Vô hiệu hóa, Đóng cửa, v.v.)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Restaurant> updateRestaurantStatus(
            @PathVariable Integer id,
            @Valid @RequestBody AdminUpdateStatusRequest request) {

        Restaurant updatedRestaurant = restaurantService.updateRestaurantStatus(id, request);
        return ResponseEntity.ok(updatedRestaurant);
    }

    /**
     * API cho Chủ nhà hàng lấy thực đơn của mình
     * (Đây là API mà trang /menu sẽ gọi)
     */
    @GetMapping("/my/menu")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESTAURANT_OWNER')")
    public ResponseEntity<List<MenuItem>> getMyMenu(@AuthenticationPrincipal CustomUserDetails user) {
        List<MenuItem> menuItems = restaurantService.getMyMenu(user);
        return ResponseEntity.ok(menuItems);
    }

    /**
     * API cho Admin/Owner upload file ảnh
     */
    @PostMapping("/upload-image")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESTAURANT_OWNER')")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // 1. Lưu file và lấy tên file đã được đặt ngẫu nhiên
            String fileName = fileStorageService.storeFile(file);
            // 2. Trả về tên file cho frontend (body chỉ chứa tên file)
            return ResponseEntity.ok(fileName);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(500).body(ex.getMessage());
        }
    }
}