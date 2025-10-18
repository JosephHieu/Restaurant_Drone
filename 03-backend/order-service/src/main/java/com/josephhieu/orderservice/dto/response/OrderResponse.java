package com.josephhieu.orderservice.dto.response;

import com.josephhieu.orderservice.entity.OrderStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private String orderId;
    private String orderCode;
    private String customerId;
    private String restaurantId;
    private BigDecimal totalAmount;
    private String deliveryAddress;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}
