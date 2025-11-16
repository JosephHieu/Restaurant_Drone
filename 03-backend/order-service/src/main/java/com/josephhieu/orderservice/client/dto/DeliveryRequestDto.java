package com.josephhieu.orderservice.client.dto;

import lombok.Data;
import java.math.BigDecimal;

// DTO này phải khớp với DeliveryRequest.java (của DroneService)
@Data
public class DeliveryRequestDto {
    private Integer orderId;
    private BigDecimal startLat;
    private BigDecimal startLng;
    private BigDecimal endLat;
    private BigDecimal endLng;
}