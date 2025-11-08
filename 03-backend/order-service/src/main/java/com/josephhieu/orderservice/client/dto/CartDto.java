package com.josephhieu.orderservice.client.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartDto {
    private Integer cartId;
    private Integer userId;
    private Integer restaurantId;
    private List<CartItemDto> cartItems;
    // (Bạn có thể thêm các trường khác như deliveryAddress nếu cần)
}