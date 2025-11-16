package com.josephhieu.orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatsDto {
    private long totalOrders;
    private long pendingOrders;
    private long deliveringOrders;
    private BigDecimal totalRevenue; // Tổng doanh thu (từ các đơn COMPLETED)
}