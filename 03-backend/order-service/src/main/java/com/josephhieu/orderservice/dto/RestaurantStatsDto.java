package com.josephhieu.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantStatsDto {
    private long totalOrders;
    private long pendingOrders;
    private long deliveringOrders;
    private BigDecimal totalRevenue;
}