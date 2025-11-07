package com.josephhieu.restaurantservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminUpdateStatusRequest {
    @NotBlank
    private String status; // Sẽ là "open", "closed", hoặc "banned"
}
