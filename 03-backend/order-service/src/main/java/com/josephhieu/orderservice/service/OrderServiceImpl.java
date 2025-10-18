package com.josephhieu.orderservice.service;

import com.josephhieu.orderservice.dto.request.OrderCreationRequest;
import com.josephhieu.orderservice.dto.request.OrderStatusUpdateRequest;
import com.josephhieu.orderservice.dto.response.OrderItemResponse;
import com.josephhieu.orderservice.dto.response.OrderResponse;
import com.josephhieu.orderservice.entity.Order;
import com.josephhieu.orderservice.entity.OrderItem;
import com.josephhieu.orderservice.entity.OrderStatus;
import com.josephhieu.orderservice.entity.OrderStatusHistory;
import com.josephhieu.orderservice.repository.OrderItemRepository;
import com.josephhieu.orderservice.repository.OrderRepository;
import com.josephhieu.orderservice.repository.OrderStatusHistoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderCreationRequest request) {
        // 1️⃣ Tính tổng tiền
        BigDecimal total = request.getItems().stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2️⃣ Tạo Order
        Order order = Order.builder()
                .orderCode("ORD-" + System.currentTimeMillis())
                .customerId(request.getCustomerId())
                .restaurantId(request.getRestaurantId())
                .deliveryAddress(request.getDeliveryAddress())
                .totalAmount(total)
                .status(OrderStatus.PENDING)
                .build();
        order = orderRepository.save(order);

        // 3️⃣ Tạo danh sách OrderItem
        for (var itemReq : request.getItems()) {
            OrderItem item = OrderItem.builder()
                    .order(order)
                    .productId(itemReq.getProductId())
                    .productName(itemReq.getProductName())
                    .quantity(itemReq.getQuantity())
                    .price(itemReq.getPrice())
                    .build();
            orderItemRepository.save(item);
        }

        // 4️⃣ Ghi log trạng thái ban đầu
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .oldStatus(null)
                .newStatus(OrderStatus.PENDING.name())
                .build();
        orderStatusHistoryRepository.save(history);

        return mapToResponse(order);
    }

    @Override
    public OrderResponse getOrderById(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(OrderStatus.valueOf(request.getNewStatus()));
        orderRepository.save(order);

        // Ghi log lịch sử thay đổi
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .oldStatus(request.getOldStatus())
                .newStatus(request.getNewStatus())
                .build();
        orderStatusHistoryRepository.save(history);

        return mapToResponse(order);
    }

    @Override
    public List<OrderResponse> getOrdersByCustomerId(String customerId) {
        return orderRepository.findByCustomerId(customerId)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 🔁 Mapper helper
    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> items = orderItemRepository.findByOrder_OrderId(order.getOrderId())
                .stream()
                .map(i -> new OrderItemResponse(
                        i.getProductName(),
                        i.getQuantity(),
                        i.getPrice(),
                        i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity()))
                ))
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .orderCode(order.getOrderCode())
                .customerId(order.getCustomerId())
                .restaurantId(order.getRestaurantId())
                .totalAmount(order.getTotalAmount())
                .deliveryAddress(order.getDeliveryAddress())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .items(items)
                .build();
    }
}
