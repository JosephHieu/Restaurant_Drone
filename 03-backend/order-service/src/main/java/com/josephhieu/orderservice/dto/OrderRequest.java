package com.josephhieu.orderservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderRequest {
    @NotBlank
    private String deliveryAddress;

    @NotBlank
    private String paymentMethod; // "COD" hoặc "VNPAY"
    
    // Tọa độ giao hàng (từ frontend)
    private BigDecimal deliveryLat;
    private BigDecimal deliveryLng;
}