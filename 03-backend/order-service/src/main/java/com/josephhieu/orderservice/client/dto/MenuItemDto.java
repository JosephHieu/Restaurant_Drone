package com.josephhieu.orderservice.client.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MenuItemDto {
    private Integer itemId;
    private Integer restaurantId;
    private String name;
    private BigDecimal price; // <-- Quan trọng: Giá món
    private String imageUri;
}