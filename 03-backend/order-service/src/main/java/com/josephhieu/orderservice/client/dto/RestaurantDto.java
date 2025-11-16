package com.josephhieu.orderservice.client.dto;
import lombok.Data;

import java.math.BigDecimal;

// DTO này chỉ cần các trường để kiểm tra
@Data
public class RestaurantDto {
    private Integer restaurantId;
    private Integer ownerId; // <-- Trường quan trọng nhất
    private String name;

    private BigDecimal latitude;
    private BigDecimal longitude;
}