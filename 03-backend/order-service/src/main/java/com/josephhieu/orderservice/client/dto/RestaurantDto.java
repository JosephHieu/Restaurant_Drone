package com.josephhieu.orderservice.client.dto;
import lombok.Data;
// DTO này chỉ cần các trường để kiểm tra
@Data
public class RestaurantDto {
    private Integer restaurantId;
    private Integer ownerId; // <-- Trường quan trọng nhất
    private String name;
}