package com.josephhieu.restaurantservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateRestaurantRequest {
    @NotBlank
    private String name;
    private String description;
    @NotBlank
    private String phone;
    @NotBlank
    private String address;

    // Thêm trường này để chủ quán có thể tự mở/đóng cửa
    @NotBlank
    private String status; // "open" hoặc "closed"
}
