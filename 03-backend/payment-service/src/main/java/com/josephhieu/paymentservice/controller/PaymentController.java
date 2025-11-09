package com.josephhieu.paymentservice.controller;

import com.josephhieu.paymentservice.dto.request.PaymentRequest;
import com.josephhieu.paymentservice.dto.response.PaymentResponse;
import com.josephhieu.paymentservice.service.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private VnPayService vnPayService;

    /**
     * API này được gọi bởi OrderService (nội bộ)
     */
    @PostMapping("/create-vnpay")
    @PreAuthorize("isAuthenticated()") // Yêu cầu token (từ OrderService)
    public ResponseEntity<PaymentResponse> createVnPayPayment(
            @Valid @RequestBody PaymentRequest paymentRequest,
            HttpServletRequest request // Cần request để lấy IP
    ) {
        // Lấy IP từ header (do Gateway chuyển tiếp) hoặc IP của Gateway
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = request.getRemoteAddr();
        }

        String paymentUrl = vnPayService.createVnPayPayment(
                paymentRequest.getOrderId(),
                paymentRequest.getAmount(),
                clientIp
        );

        return ResponseEntity.ok(new PaymentResponse(paymentUrl));
    }

    // (Sau này bạn sẽ thêm API GET /vnpay-ipn ở đây)
}