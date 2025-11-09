package com.josephhieu.userservice.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CartItemResponseDto {
    private Integer cartItemId;
    private Integer itemId;
    private Integer quantity;
    private String note;

    // Các trường "đầy đủ" (enriched)
    private String name;
    private BigDecimal price;
    private String imageUri;
}