package com.josephhieu.orderservice.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {
    private String productName;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal total;
}
