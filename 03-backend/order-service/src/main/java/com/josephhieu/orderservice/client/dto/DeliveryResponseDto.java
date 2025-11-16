package com.josephhieu.orderservice.client.dto;

import lombok.Data;
import java.math.BigDecimal;

// DTO này phải khớp với Delivery (Entity) của DroneService
@Data
public class DeliveryResponseDto {
    private Integer deliveryId;
    private Integer orderId;
    private String status;
    private Integer droneId; // (Chúng ta cần ID của drone)
}