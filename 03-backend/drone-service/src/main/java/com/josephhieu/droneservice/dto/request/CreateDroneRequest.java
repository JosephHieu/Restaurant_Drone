package com.josephhieu.droneservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class CreateDroneRequest {

    @NotBlank(message = "Model không được để trống")
    private String model;

    @Min(value = 0, message = "Pin phải lớn hơn 0")
    @Max(value = 100, message = "Pin không thể lớn hơn 100")
    private Integer batteryLevel = 100; // Mặc định là 100%
}