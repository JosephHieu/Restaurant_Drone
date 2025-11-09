package com.josephhieu.userservice.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class CartResponseDto {
    private Integer cartId;
    private Integer userId;
    private Integer restaurantId;
    private List<CartItemResponseDto> cartItems;
}