package com.josephhieu.userservice.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
@Data
public class AddToCartRequest {
    @NotNull
    private Integer itemId;
    @NotNull
    private Integer restaurantId;
    @NotNull @Min(1)
    private Integer quantity;
    private String note;
}