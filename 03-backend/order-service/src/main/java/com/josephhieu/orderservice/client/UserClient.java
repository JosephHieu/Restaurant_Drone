package com.josephhieu.orderservice.client;

import com.josephhieu.orderservice.client.dto.CartDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

// Tên service phải khớp với tên đã đăng ký trên Eureka
@FeignClient(name = "USER-SERVICE")
public interface UserClient {

    // API lấy giỏ hàng của user đang đăng nhập
    @GetMapping("/api/cart")
    CartDto getCart(@RequestHeader("Authorization") String authorizationHeader);

    // API xóa giỏ hàng (sau khi đặt hàng thành công)
    @DeleteMapping("/api/cart")
    void clearCart(@RequestHeader("Authorization") String authorizationHeader);

    // API lấy chi tiết user (nếu cần địa chỉ giao hàng)
    // @GetMapping("/api/users/{id}")
    // UserDto getUserDetails(@PathVariable Integer id);
}