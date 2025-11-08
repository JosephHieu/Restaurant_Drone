package com.josephhieu.restaurantservice.controller;

import com.josephhieu.restaurantservice.dto.request.CreateMenuItemRequest;
import com.josephhieu.restaurantservice.entity.MenuItem;
import com.josephhieu.restaurantservice.security.CustomUserDetails;
import com.josephhieu.restaurantservice.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
public class MenuItemController {

    @Autowired
    private RestaurantService restaurantService;

    // === API PUBLIC (CHO SERVICE KHÁC GỌI) ===

    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> getMenuItemById(@PathVariable Integer id) {
        return ResponseEntity.ok(restaurantService.getMenuItemById(id));
    }

    // === API PROTECTED (CẦN ĐĂNG NHẬP) ===

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESTAURANT_OWNER')")
    public ResponseEntity<MenuItem> updateMenuItem(
            @PathVariable("id") Integer itemId,
            @Valid @RequestBody CreateMenuItemRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {
        MenuItem updatedItem = restaurantService.updateMenuItem(itemId, request, user);
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESTAURANT_OWNER')")
    public ResponseEntity<?> deleteMenuItem(
            @PathVariable("id") Integer itemId,
            @AuthenticationPrincipal CustomUserDetails user) {
        restaurantService.deleteMenuItem(itemId, user);
        return ResponseEntity.ok("Menu item deleted successfully.");
    }

    /**
     * API PUBLIC: Lấy tất cả món ăn (cho trang chủ client-web)
     */
    @GetMapping("/public/all")
    public ResponseEntity<List<MenuItem>> getAllPublicMenuItems() {
        return ResponseEntity.ok(restaurantService.getAllPublicMenuItems());
    }
}