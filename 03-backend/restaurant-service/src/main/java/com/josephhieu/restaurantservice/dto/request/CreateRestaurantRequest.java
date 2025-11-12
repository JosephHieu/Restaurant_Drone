package com.josephhieu.restaurantservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateRestaurantRequest {
    @NotBlank
    private String name;
    private String description;
    @NotBlank
    private String phone;
    @NotBlank
    private String address;

    // === THÊM DÒNG NÀY ===
    // (Cho phép Admin chỉ định ai là chủ)
    @NotNull
    private Integer ownerId;

    private String coverImageUri;
}