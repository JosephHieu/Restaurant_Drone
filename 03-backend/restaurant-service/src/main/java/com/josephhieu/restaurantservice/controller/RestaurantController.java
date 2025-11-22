package com.josephhieu.restaurantservice.controller;

import com.josephhieu.restaurantservice.dto.MenuItemPublicDto; // <-- Import DTO
import com.josephhieu.restaurantservice.dto.request.*;
import com.josephhieu.restaurantservice.entity.Restaurant;
import com.josephhieu.restaurantservice.security.CustomUserDetails;
import com.josephhieu.restaurantservice.service.CloudinaryService;
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
    private CloudinaryService cloudinaryService;

    // === API CỦA CHỦ NHÀ HÀNG (OWNER) ===

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('RESTAURANT_OWNER')")
    public ResponseEntity<Restaurant> getMyRestaurant(
            @AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(restaurantService.getMyRestaurant(user));
    }

    // API CŨ (GÂY LỖI LOGIC NẾU CÓ NHIỀU QUÁN)
    @PutMapping("/my")
    @PreAuthorize("hasAuthority('RESTAURANT_OWNER')")
    public ResponseEntity<Restaurant> updateMyRestaurant(
            @Valid @RequestBody UpdateRestaurantRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        Restaurant updatedRestaurant = restaurantService.updateMyRestaurant(user, request);
        return ResponseEntity.ok(updatedRestaurant);
    }

    @GetMapping("/my/all")
    @PreAuthorize("hasAuthority('RESTAURANT_OWNER')")
    public ResponseEntity<List<Restaurant>> getMyAllRestaurants(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Restaurant> restaurants = restaurantService.getAllRestaurantsByOwnerId(userDetails.getId());
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/my/menu")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESTAURANT_OWNER')")
    public ResponseEntity<List<MenuItemPublicDto>> getMyMenu(@AuthenticationPrincipal CustomUserDetails user) { // <-- Sửa kiểu
        List<MenuItemPublicDto> menuItems = restaurantService.getMyMenu(user);
        return ResponseEntity.ok(menuItems);
    }

    // === API CỦA ADMIN ===

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        List<Restaurant> restaurants = restaurantService.getAllRestaurantsForAdmin();
        return ResponseEntity.ok(restaurants);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Restaurant> approveRestaurant(@PathVariable Integer id) {
        Restaurant updatedRestaurant = restaurantService.approveRestaurant(id);
        return ResponseEntity.ok(updatedRestaurant);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Restaurant> updateRestaurantStatus(
            @PathVariable Integer id,
            @Valid @RequestBody AdminUpdateStatusRequest request) {
        Restaurant updatedRestaurant = restaurantService.updateRestaurantStatus(id, request);
        return ResponseEntity.ok(updatedRestaurant);
    }

    // SỬA LỖI XUNG ĐỘT: Đổi tên đường dẫn
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Restaurant> adminUpdateRestaurant(
            @PathVariable Integer id,
            @Valid @RequestBody AdminUpdateRestaurantRequest request,
            @AuthenticationPrincipal CustomUserDetails user) { // <-- Thêm UserDetails

        Restaurant updatedRestaurant = restaurantService.adminUpdateRestaurant(id, request, user);
        return ResponseEntity.ok(updatedRestaurant);
    }

    @GetMapping("/owner-check/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Boolean> checkUserOwnership(@PathVariable Integer userId) {
        return ResponseEntity.ok(restaurantService.checkUserOwnership(userId));
    }

    // === API CHUNG (PUBLIC) ===

    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllOpenRestaurants() {
        return ResponseEntity.ok(restaurantService.getAllOpenRestaurants());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable Integer id) {
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }

    // SỬA LỖI 500
    @GetMapping("/{id}/menu")
    public ResponseEntity<List<MenuItemPublicDto>> getMenuForRestaurant(@PathVariable Integer id) { // <-- Sửa kiểu
        // Sửa: Gọi hàm mới trả về DTO
        return ResponseEntity.ok(restaurantService.getPublicMenuItemsByRestaurant(id));
    }

    // === API CHUNG (PROTECTED) ===

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESTAURANT_OWNER')")
    public ResponseEntity<Restaurant> createRestaurant(
            @Valid @RequestBody CreateRestaurantRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        Restaurant newRestaurant = restaurantService.createRestaurant(request, user);
        return ResponseEntity.status(201).body(newRestaurant);
    }

    // SỬA LỖI 500
    @PostMapping("/{id}/menu-items")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESTAURANT_OWNER')")
    public ResponseEntity<MenuItemPublicDto> createMenuItem( // <-- Sửa kiểu
                                                             @PathVariable("id") Integer restaurantId,
                                                             @Valid @RequestBody CreateMenuItemRequest request,
                                                             @AuthenticationPrincipal CustomUserDetails user) {
        MenuItemPublicDto newItem = restaurantService.createMenuItemAndReturnDto(restaurantId, request, user); // <-- Gọi hàm mới
        return ResponseEntity.status(201).body(newItem);
    }

    @PostMapping("/upload-image")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESTAURANT_OWNER')")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        String url = cloudinaryService.uploadFile(file);
        return ResponseEntity.ok(url);
    }
}