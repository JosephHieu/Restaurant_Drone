package com.josephhieu.restaurantservice.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateMenuItemRequest {
    @NotBlank
    private String name;
    private String description;

    @NotNull
    @Min(0)
    private Double price;

    private String imageUri;
    private boolean isAvailable = true;
}
