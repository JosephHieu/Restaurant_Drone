package com.josephhieu.paymentservice.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Đây là DTO "chung" mà PaymentService trả về
 * cho OrderService, bất kể là VNPAY hay MoMo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    /**
     * Mã kết quả (VNPAY là "00", MoMo là "0")
     */
    private String code;

    /**
     * Thông báo (VNPAY là "Success", MoMo là "Thành công.")
     */
    private String message;

    /**
     * URL để chuyển hướng người dùng đến
     */
    private String paymentUrl;

    /**
     * Constructor 1 tham số để chỉ cần truyền code
     */
    public PaymentResponse(String code) {
        this.code = code;
    }
}
