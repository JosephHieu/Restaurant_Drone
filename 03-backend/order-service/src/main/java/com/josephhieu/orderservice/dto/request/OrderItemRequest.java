package com.josephhieu.orderservice.dto.request;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemRequest {
    private String productId;
    private String productName;
    private Integer quantity;
    private BigDecimal price;
}
