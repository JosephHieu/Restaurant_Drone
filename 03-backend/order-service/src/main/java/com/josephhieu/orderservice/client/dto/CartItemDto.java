package com.josephhieu.orderservice.client.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CartItemDto {
    private Integer itemId;
    private Integer quantity;
    private String note;
}