package com.josephhieu.userservice.client;

import com.josephhieu.userservice.client.dto.MenuItemDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

// Tên "RESTAURANT-SERVICE" phải khớp với tên trên Eureka
@FeignClient(name = "RESTAURANT-SERVICE")
public interface RestaurantClient {

    // Chữ ký hàm này phải khớp với API trong RestaurantController
    @GetMapping("/api/restaurants/owner-check/{userId}")
    Boolean checkUserOwnership(
            @PathVariable("userId") Integer userId,
            // Chúng ta cần chuyển tiếp token của Admin
            @RequestHeader("Authorization") String authorizationHeader
    );

    @GetMapping("/api/menu-items/{id}")
    MenuItemDto getMenuItemById(@PathVariable("id") Integer id);
}