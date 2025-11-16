package com.josephhieu.orderservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {

    @NotBlank
    private String status; // Sẽ là "CONFIRMED" hoặc "READY_FOR_DELIVERY"
}