package com.josephhieu.orderservice.client.dto;
import lombok.Data;
import java.math.BigDecimal;
@Data
public class PaymentRequest {
    private Integer orderId;
    private BigDecimal amount;
}