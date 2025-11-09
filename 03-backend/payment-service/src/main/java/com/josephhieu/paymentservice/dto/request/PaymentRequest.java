package com.josephhieu.paymentservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest { // DTO nhận từ OrderService
    @NotNull
    private Integer orderId;
    @NotNull
    private BigDecimal amount;
}