package com.josephhieu.restaurantservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateRestaurantRequest {
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

    // === THÊM DÒNG NÀY ===
    // (Cho phép Admin chỉ định ai là chủ)
    @NotNull
    private Integer ownerId;

    private String coverImageUri;
}