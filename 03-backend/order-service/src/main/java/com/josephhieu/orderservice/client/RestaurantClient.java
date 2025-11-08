package com.josephhieu.orderservice.client;

import com.josephhieu.orderservice.client.dto.MenuItemDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// Tên service phải khớp với tên đã đăng ký trên Eureka
@FeignClient(name = "RESTAURANT-SERVICE")
public interface RestaurantClient {

    // API lấy chi tiết 1 món ăn (để lấy giá snapshot)
    @GetMapping("/api/menu-items/{id}")
    MenuItemDto getMenuItemById(@PathVariable("id") Integer id);
}