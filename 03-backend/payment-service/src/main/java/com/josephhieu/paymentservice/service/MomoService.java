package com.josephhieu.paymentservice.service;

import com.josephhieu.paymentservice.client.MomoApi;
import com.josephhieu.paymentservice.dto.request.MomoRequest;
import com.josephhieu.paymentservice.dto.request.PaymentRequest;
import com.josephhieu.paymentservice.dto.response.MomoResponse;
import com.josephhieu.paymentservice.entity.Payment;
import com.josephhieu.paymentservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MomoService {

    @Value("${momo.partner-code}")
    private String PARTNER_CODE;

    @Value("${momo.access-key}")
    private String ACCESS_KEY;

    @Value("${momo.secret-key}")
    private String SECRET_KEY;

    @Value("${momo.redirect-url}")
    private String REDIRECT_URL;

    @Value("${momo.ipn-url}")
    private String IPN_URL;

    @Value("${momo.request-type}")
    private String REQUEST_TYPE;

    private final PaymentRepository paymentRepository;
    private final MomoApi momoApi;

    @Transactional // <-- BỔ SUNG
    public MomoResponse createPayment(PaymentRequest paymentData) throws Exception { // <-- SỬA: Nhận DTO chung

        // 1. Lưu giao dịch PENDING vào CSDL
        Payment payment = new Payment();
        payment.setOrderId(paymentData.getOrderId());
        payment.setAmount(paymentData.getAmount());
        payment.setMethod("MOMO");
        payment.setStatus("PENDING");
        paymentRepository.save(payment); // Lưu để lấy paymentId

        // 2. Lấy dữ liệu động từ DTO
        String requestId = UUID.randomUUID().toString();
        // Dùng ID thanh toán (paymentId) + requestId để đảm bảo orderId là duy nhất
        String uniqueOrderId = payment.getPaymentId() + "_" + requestId;
        String orderInfo = "Thanh toan don hang " + paymentData.getOrderId();
        String extraData = "";

        // MoMo dùng số nguyên (lấy từ .intValue() của bạn)
        String amount = String.valueOf(paymentData.getAmount().intValue());

        // 3. Chuỗi rawSignature đúng theo tài liệu MoMo
        String rawSignature =
                "accessKey=" + ACCESS_KEY +
                        "&amount=" + amount +
                        "&extraData=" + extraData +
                        "&ipnUrl=" + IPN_URL +
                        "&orderId=" + uniqueOrderId + // <-- Sửa: Dùng ID duy nhất
                        "&orderInfo=" + orderInfo +
                        "&partnerCode=" + PARTNER_CODE +
                        "&redirectUrl=" + REDIRECT_URL +
                        "&requestId=" + requestId +
                        "&requestType=" + REQUEST_TYPE;

        log.info("MoMo Raw signature = {}", rawSignature);

        String signature;
        try {
            // Sửa: Gọi hàm Hashing từ MomoConfig
            signature = signHmacSHA256(rawSignature, SECRET_KEY);
        } catch (Exception e) {
            log.error("Error hashing signature: {}", e.getMessage());
            throw e; // Ném lỗi ra ngoài
        }

        // 4. Build request chuẩn MoMo
        MomoRequest request = MomoRequest.builder()
                .partnerCode(PARTNER_CODE)
                .requestType(REQUEST_TYPE)
                .ipnUrl(IPN_URL)
                .redirectUrl(REDIRECT_URL)
                .orderId(uniqueOrderId) // <-- Sửa
                .orderInfo(orderInfo)
                .requestId(requestId)
                .extraData(extraData)
                .amount(Long.valueOf(amount)) // <-- Sửa: Dùng kiểu long
                .signature(signature)
                .lang("vi")
                .build();

        // 5. Gọi API MoMo
        MomoResponse response = momoApi.createMomoQR(request);

        if (response == null || response.getPayUrl() == null) {
            log.error("Lỗi khi tạo MoMo Payment: {}", (response != null ? response.getMessage() : "Response null"));
            throw new RuntimeException("Lỗi khi tạo thanh toán MoMo.");
        }

        return response;
    }

    private String signHmacSHA256(String data, String key) throws Exception {
        Mac hmacSHA256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmacSHA256.init(secretKey);
        byte[] hash = hmacSHA256.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
