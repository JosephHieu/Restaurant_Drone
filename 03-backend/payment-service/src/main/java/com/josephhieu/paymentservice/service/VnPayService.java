package com.josephhieu.paymentservice.service;

import com.josephhieu.paymentservice.config.VnPayConfig;
import com.josephhieu.paymentservice.entity.Payment;
import com.josephhieu.paymentservice.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;

@Service
public class VnPayService {

    @Autowired
    private PaymentRepository paymentRepository;

    // Lấy config từ application.yml
    @Value("${vnpay.tmnCode}")
    private String tmnCode;
    @Value("${vnpay.hashSecret}")
    private String hashSecret;
    @Value("${vnpay.url}")
    private String vnpUrl;
    @Value("${vnpay.returnUrl}")
    private String returnUrl;
    @Value("${vnpay.ipnUrl}")
    private String ipnUrl;

    @Transactional
    public String createVnPayPayment(Integer orderId, BigDecimal amount, String clientIp) {

        // 1. Tạo bản ghi Payment trong CSDL (status: PENDING)
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setAmount(amount);
        payment.setMethod("VNPAY");
        payment.setStatus("PENDING");
        paymentRepository.save(payment);

        // 2. Xây dựng tham số cho VNPay
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", tmnCode);

        // VNPay yêu cầu nhân 100 (vì họ không dùng số thập phân)
        long vnpAmount = amount.multiply(new BigDecimal(100)).longValue();
        vnp_Params.put("vnp_Amount", String.valueOf(vnpAmount));
        vnp_Params.put("vnp_CurrCode", "VND");

        // Dùng ID của bảng Payment (ví dụ: 1, 2, 3) làm mã giao dịch
        vnp_Params.put("vnp_TxnRef", String.valueOf(payment.getPaymentId()));
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + orderId);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", returnUrl); // URL Frontend
        vnp_Params.put("vnp_IpAddr", clientIp);
        vnp_Params.put("vnp_IpnURL", ipnUrl); // URL Backend (ngrok)

        // Đặt thời gian
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));

        cld.add(Calendar.MINUTE, 15); // Hết hạn sau 15 phút
        vnp_Params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

        // 3. Tạo URL thanh toán (đã bao gồm chữ ký HASH)
        String paymentUrl = VnPayConfig.getPaymentUrl(vnp_Params, hashSecret, vnpUrl);

        return paymentUrl;
    }
}