package com.josephhieu.userservice.client.dto;
import lombok.Data;
import java.math.BigDecimal;
// DTO này phải khớp với DTO (hoặc Entity) của RestaurantService
@Data
public class MenuItemDto {
    private Integer itemId;
    private String name;
    private BigDecimal price;
    private String imageUri;
}