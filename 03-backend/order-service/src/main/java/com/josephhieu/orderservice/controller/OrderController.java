package com.josephhieu.orderservice.controller;

import com.josephhieu.orderservice.dto.OrderRequest;
import com.josephhieu.orderservice.dto.OrderResponseDto;
import com.josephhieu.orderservice.dto.UpdateOrderStatusRequest;
import com.josephhieu.orderservice.entity.Order;
import com.josephhieu.orderservice.security.CustomUserDetails;
import com.josephhieu.orderservice.service.OrderService;
import jakarta.validation.Valid;
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

    /**
     * API chính để tạo đơn hàng
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponseDto> createOrder(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody OrderRequest orderRequest) {

        // SỬA 2: Nhận DTO mới
        OrderResponseDto newOrderResponse = orderService.createOrder(user, orderRequest);
        return ResponseEntity.status(201).body(newOrderResponse);
    }

    /**
     * API cho khách hàng xem lịch sử đơn hàng của họ
     */
    @GetMapping("/my-history")
    @PreAuthorize("isAuthenticated()") // Yêu cầu phải đăng nhập
    public ResponseEntity<List<Order>> getMyOrderHistory(
            @AuthenticationPrincipal CustomUserDetails user) {

        List<Order> orders = orderService.getMyOrderHistory(user);
        return ResponseEntity.ok(orders);
    }

    /**
     * API cho khách hàng xem chi tiết 1 đơn hàng
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()") // Yêu cầu phải đăng nhập
    public ResponseEntity<Order> getOrderById(
            @PathVariable Integer id,
            @AuthenticationPrincipal CustomUserDetails user) {

        Order order = orderService.getOrderById(id, user);
        return ResponseEntity.ok(order);
    }

    /**
     * API cho Chủ nhà hàng lấy danh sách đơn hàng (cho Kanban Board)
     */
    @GetMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESTAURANT_OWNER')")
    public ResponseEntity<List<Order>> getRestaurantOrders(
            @PathVariable Integer restaurantId,
            @AuthenticationPrincipal CustomUserDetails user) {

        List<Order> orders = orderService.getRestaurantOrders(restaurantId, user);
        return ResponseEntity.ok(orders);
    }

    /**
     * API cho Chủ nhà hàng cập nhật trạng thái (Xác nhận / Sẵn sàng)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'RESTAURANT_OWNER')")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            @AuthenticationPrincipal CustomUserDetails user) {

        Order updatedOrder = orderService.updateOrderStatus(id, request, user);
        return ResponseEntity.ok(updatedOrder);
    }

    /**
     * API cho ADMIN lấy TẤT CẢ đơn hàng
     */
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders(
            @AuthenticationPrincipal CustomUserDetails user) {

        List<Order> orders = orderService.getAllOrdersForAdmin(user);
        return ResponseEntity.ok(orders);
    }
}