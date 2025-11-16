package com.josephhieu.droneservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateStatusRequest {

    @NotBlank(message = "Trạng thái không được để trống")
    private String status; // Ví dụ: "IDLE", "MAINTENANCE"
}