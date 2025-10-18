package com.josephhieu.orderservice.service;

import com.josephhieu.orderservice.dto.request.OrderCreationRequest;
import com.josephhieu.orderservice.dto.request.OrderStatusUpdateRequest;
import com.josephhieu.orderservice.dto.response.OrderResponse;
import com.josephhieu.orderservice.entity.OrderStatus;
import org.springframework.stereotype.Service;

import java.util.List;

public interface OrderService {

    // Tạo đơn hàng mới
    OrderResponse createOrder(OrderCreationRequest request);

    // Lấy chi tiết đơn hàng
    OrderResponse getOrderById(String orderId);

    // Cập nhật trạng thái đơn hàng
    OrderResponse updateOrderStatus(OrderStatusUpdateRequest request);

    // Lấy danh sách đơn hàng theo user
    List<OrderResponse> getOrdersByCustomerId(String customerId);

    // Lấy tất cả đơn hàng theo trạng thái
    List<OrderResponse> getOrdersByStatus(OrderStatus status);
}
