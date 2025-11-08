package com.josephhieu.orderservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderRequest {
    @NotBlank
    private String deliveryAddress;

    @NotBlank
    private String paymentMethod; // "COD" hoặc "VNPAY"
}