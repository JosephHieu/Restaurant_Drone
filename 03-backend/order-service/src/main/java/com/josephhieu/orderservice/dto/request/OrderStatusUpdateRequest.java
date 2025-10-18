package com.josephhieu.orderservice.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusUpdateRequest {
    private String orderId;
    private String oldStatus;
    private String newStatus;
}
