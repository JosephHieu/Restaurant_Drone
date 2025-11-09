package com.josephhieu.orderservice.client;

import com.josephhieu.orderservice.client.dto.PaymentRequest;
import com.josephhieu.orderservice.client.dto.PaymentResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

// Tên service phải khớp 100% với tên trên Eureka
@FeignClient(name = "PAYMENT-SERVICE")
public interface PaymentClient {

    // Chữ ký hàm phải khớp với API trong PaymentController
    @PostMapping("/api/payments/create-vnpay")
    PaymentResponse createVnPayPayment(
            @RequestBody PaymentRequest paymentRequest,
            // Quan trọng: Chuyển tiếp token của user
            @RequestHeader("Authorization") String authorizationHeader
    );
}