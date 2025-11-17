package com.josephhieu.paymentservice.controller;

import com.josephhieu.paymentservice.constant.MomoParameter;
import com.josephhieu.paymentservice.dto.request.PaymentRequest;
import com.josephhieu.paymentservice.dto.response.MomoResponse;
import com.josephhieu.paymentservice.dto.response.PaymentResponse;
import com.josephhieu.paymentservice.service.MomoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/momo")
public class MomoController {

    private final MomoService momoService;


    @PostMapping("create")
    public ResponseEntity<PaymentResponse> createMoMoPayment(
            @RequestBody PaymentRequest paymentRequest) { // <-- Sửa: Nhận DTO chung

        try {
            MomoResponse momoResponse = momoService.createPayment(
                    paymentRequest // <-- Truyền DTO vào service
            );

            // Trả về DTO chung (giống VNPAY)
            return ResponseEntity.ok(new PaymentResponse(
                    String.valueOf(momoResponse.getResultCode()),
                    momoResponse.getMessage(),
                    momoResponse.getPayUrl()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(new PaymentResponse("500", e.getMessage(), null));
        }
    }

    @GetMapping("ipn-handler")
    public String ipnHandler(@RequestParam Map<String, String> request) {
        Integer resultCode = Integer.valueOf(request.get(MomoParameter.RESULT_CODE));
        return resultCode == 0 ? "Giao dich thanh cong" : "Giao dich that bai";
    }
}
