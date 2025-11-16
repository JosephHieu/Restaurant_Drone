package com.josephhieu.orderservice.client;

import com.josephhieu.orderservice.client.dto.DeliveryRequestDto;
import com.josephhieu.orderservice.client.dto.DeliveryResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

// Tên service phải khớp 100% với tên trên Eureka
@FeignClient(name = "DRONE-SERVICE")
public interface DroneClient {

    // Chữ ký hàm phải khớp với API trong DeliveryController (của DroneService)
    @PostMapping("/api/deliveries")
    DeliveryResponseDto createDelivery(
            @RequestBody DeliveryRequestDto deliveryRequest,
            @RequestHeader("Authorization") String authorizationHeader
    );
}