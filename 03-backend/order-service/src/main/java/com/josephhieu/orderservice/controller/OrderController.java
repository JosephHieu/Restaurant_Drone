package com.josephhieu.orderservice.controller;

import com.josephhieu.orderservice.entity.Order;
import com.josephhieu.orderservice.service.OrderService;
import com.josephhieu.orderservice.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Yêu cầu token của Khách hàng hoặc Chủ nhà hàng
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Order> createOrder(@AuthenticationPrincipal CustomUserDetails user) {
        Order newOrder = orderService.createOrder(user);
        return ResponseEntity.status(201).body(newOrder);
    }

    // (Các API khác như GET /my/orders, GET /admin/orders sẽ được thêm sau)

}