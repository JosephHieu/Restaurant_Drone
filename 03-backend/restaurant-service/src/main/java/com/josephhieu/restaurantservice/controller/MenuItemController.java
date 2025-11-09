package com.josephhieu.restaurantservice.controller;

import com.josephhieu.restaurantservice.dto.MenuItemPublicDto;
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
import java.util.Optional;

@RestController
@RequestMapping("/api/menu-items")
public class MenuItemController {

    @Autowired
    private RestaurantService restaurantService;


    // === API PUBLIC ===

    // SỬA LỖI 500
    @GetMapping("/{id}")
    public ResponseEntity<MenuItemPublicDto> getMenuItemById(@PathVariable Integer id) { // <-- Sửa kiểu
        // Sửa: Gọi hàm mới trả về DTO
        return ResponseEntity.ok(restaurantService.getMenuItemByIdAndReturnDto(id));
    }

    @GetMapping("/public/all")
    public ResponseEntity<List<MenuItemPublicDto>> getAllPublicMenuItems(
            @RequestParam(required = false) Integer restaurantId
    ) {
        return ResponseEntity.ok(restaurantService.getAllPublicMenuItems(Optional.ofNullable(restaurantId)));
    }

    // === API PROTECTED ===

    // SỬA LỖI 500
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESTAURANT_OWNER')")
    public ResponseEntity<MenuItemPublicDto> updateMenuItem( // <-- Sửa kiểu
                                                             @PathVariable("id") Integer itemId,
                                                             @Valid @RequestBody CreateMenuItemRequest request,
                                                             @AuthenticationPrincipal CustomUserDetails user) {
        // Sửa: Gọi hàm mới trả về DTO
        MenuItemPublicDto updatedItem = restaurantService.updateMenuItemAndReturnDto(itemId, request, user);
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
}