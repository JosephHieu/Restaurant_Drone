package com.josephhieu.restaurantservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateRestaurantRequest {
    @NotBlank
    private String name;
    private String description;
    @NotBlank
    private String phone;
    @NotBlank
    private String address;

    @NotNull
    private BigDecimal latitude;
    @NotNull
    private BigDecimal longitude;

    // Thêm trường này để chủ quán có thể tự mở/đóng cửa
    @NotBlank
    private String status; // "open" hoặc "closed"
}
