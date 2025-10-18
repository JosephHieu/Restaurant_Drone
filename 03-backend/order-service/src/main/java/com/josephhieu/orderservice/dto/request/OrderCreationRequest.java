package com.josephhieu.orderservice.dto.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreationRequest {

    private String customerId;
    private String restaurantId;
    private String deliveryAddress;
    private List<OrderItemRequest> items;
}
