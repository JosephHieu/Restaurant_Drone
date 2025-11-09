package com.josephhieu.orderservice.dto;

import com.josephhieu.orderservice.entity.Order;
import lombok.Data;

@Data
public class OrderResponseDto {
    private Order order; // Thông tin đơn hàng (ID, tổng tiền...)
    private String paymentUrl; // URL của VNPay (hoặc "COD" nếu là COD)

    public OrderResponseDto(Order order, String paymentUrl) {
        this.order = order;
        this.paymentUrl = paymentUrl;
    }
}