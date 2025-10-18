package com.josephhieu.orderservice.controller;

import com.josephhieu.orderservice.dto.request.OrderCreationRequest;
import com.josephhieu.orderservice.dto.request.OrderStatusUpdateRequest;
import com.josephhieu.orderservice.dto.response.OrderResponse;
import com.josephhieu.orderservice.entity.OrderStatus;
import com.josephhieu.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     Tạo đơn hàng mới
     */
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderCreationRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 🔍 Lấy chi tiết đơn hàng theo ID
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable String orderId) {
        OrderResponse response = orderService.getOrderById(orderId);
        return ResponseEntity.ok(response);
    }

    /**
     * ♻️ Cập nhật trạng thái đơn hàng
     */
    @PutMapping("/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(@RequestBody OrderStatusUpdateRequest request) {
        OrderResponse response = orderService.updateOrderStatus(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 👤 Lấy tất cả đơn hàng của 1 khách hàng
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByCustomer(@PathVariable String customerId) {
        List<OrderResponse> orders = orderService.getOrdersByCustomerId(customerId);
        return ResponseEntity.ok(orders);
    }

    /**
     * Lấy tất cả đơn hàng theo trạng thái
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(@PathVariable OrderStatus status) {
        List<OrderResponse> orders = orderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }
}
