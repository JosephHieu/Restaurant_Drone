package com.josephhieu.orderservice.controller;

import com.josephhieu.orderservice.dto.OrderRequest;
import com.josephhieu.orderservice.entity.Order;
import com.josephhieu.orderservice.security.CustomUserDetails;
import com.josephhieu.orderservice.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * API chính để tạo đơn hàng
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()") // Bất cứ ai đã đăng nhập (USER, ADMIN...)
    public ResponseEntity<Order> createOrder(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody OrderRequest orderRequest) {

        Order newOrder = orderService.createOrder(user, orderRequest);
        return ResponseEntity.status(201).body(newOrder);
    }

    // (Thêm các API GET khác ở đây)
}