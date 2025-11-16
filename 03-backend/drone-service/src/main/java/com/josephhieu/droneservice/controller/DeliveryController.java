package com.josephhieu.droneservice.controller;

import com.josephhieu.droneservice.dto.request.DeliveryRequest;
import com.josephhieu.droneservice.entity.Delivery;
import com.josephhieu.droneservice.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller này dùng cho giao tiếp NỘI BỘ (Inter-Service)
 * (OrderService sẽ gọi API này)
 */
@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    /**
     * API để OrderService tạo một chuyến giao hàng mới
     */
    @PostMapping
    public ResponseEntity<Delivery> createDelivery(@Valid @RequestBody DeliveryRequest request) {

        Delivery newDelivery = deliveryService.createDelivery(
                request.getOrderId(),
                request.getStartLat(),
                request.getStartLng(),
                request.getEndLat(),
                request.getEndLng()
        );
        return ResponseEntity.status(201).body(newDelivery);
    }
}