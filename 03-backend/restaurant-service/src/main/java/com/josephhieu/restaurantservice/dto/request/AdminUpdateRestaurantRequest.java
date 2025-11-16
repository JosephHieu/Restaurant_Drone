package com.josephhieu.restaurantservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdminUpdateRestaurantRequest {
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

    @NotNull
    private Integer ownerId; // Admin có thể gán lại chủ sở hữu

    @NotBlank
    private String status; // Admin có thể đổi "open", "closed", "banned"

    private String coverImageUri;
}