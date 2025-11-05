package com.josephhieu.userservice.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateCartItemRequest {

    @NotNull
    @Min(value = 1, message = "Số lượng phải ít nhất là 1")
    private Integer quantity;
}