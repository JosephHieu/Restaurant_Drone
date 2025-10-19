package com.josephhieu.restaurantservice.controller;

import com.josephhieu.restaurantservice.dto.request.CreateMenuItemRequest;
import com.josephhieu.restaurantservice.dto.request.CreateRestaurantRequest;
import com.josephhieu.restaurantservice.dto.response.MenuItemResponse;
import com.josephhieu.restaurantservice.dto.response.RestaurantResponse;
import com.josephhieu.restaurantservice.service.MenuItemService;
import com.josephhieu.restaurantservice.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Đánh dấu đây là một REST Controller
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // cho phép frontend lăng nghe
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final MenuItemService menuItemService;

    @PostMapping
    public ResponseEntity<RestaurantResponse> createRestaurant(@RequestBody CreateRestaurantRequest request) {
        RestaurantResponse createdRestaurant = restaurantService.createRestaurant(request);
        // Trả về status 201 Created cùng với thông tin nhà hàng vừa tạo
        return new ResponseEntity<>(createdRestaurant, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<RestaurantResponse>> getAllRestaurants() {
        List<RestaurantResponse> restaurants = restaurantService.getAllRestaurants();
        return ResponseEntity.ok(restaurants); // Trả về status 200 OK
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurantById(@PathVariable String id) {
        RestaurantResponse restaurant = restaurantService.getRestaurantById(id);
        return ResponseEntity.ok(restaurant);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable String id) {
        restaurantService.deleteRestaurant(id);
        return ResponseEntity.noContent().build(); // Trả về status 204 No Content
    }

    @PostMapping("/{restaurantId}/menu-items")
    public ResponseEntity<MenuItemResponse> createMenuItem(
            @PathVariable String restaurantId,
            @RequestBody CreateMenuItemRequest request) {
        MenuItemResponse createdMenuItem = menuItemService.createMenuItem(restaurantId, request);
        return new ResponseEntity<>(createdMenuItem, HttpStatus.CREATED);
    }

    @GetMapping("/{restaurantId}/menu-items")
    public ResponseEntity<List<MenuItemResponse>> getMenuItemsByRestaurantId(@PathVariable String restaurantId) {
        List<MenuItemResponse> menuItems = menuItemService.getMenuItemsByRestaurantId(restaurantId);
        return ResponseEntity.ok(menuItems);
    }
}
