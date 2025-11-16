package com.josephhieu.droneservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

/**
 * DTO này nhận dữ liệu từ OrderService (qua Feign Client)
 * để tạo một chuyến giao hàng mới.
 * (Khớp với DeliveryRequestDto.java bên OrderService)
 */
@Data
public class DeliveryRequest {

    @NotNull
    private Integer orderId;

    @NotNull
    private BigDecimal startLat;

    @NotNull
    private BigDecimal startLng;

    @NotNull
    private BigDecimal endLat;

    @NotNull
    private BigDecimal endLng;
}