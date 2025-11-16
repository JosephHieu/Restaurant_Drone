package com.josephhieu.paymentservice.service;

import com.josephhieu.paymentservice.config.VnPayConfig; // <-- Dùng config mới
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

    // Lấy config từ application.yml (giữ nguyên)
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

        // 1. Tạo bản ghi Payment trong CSDL
        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setAmount(amount);
        payment.setMethod("VNPAY");
        payment.setStatus("PENDING");
        paymentRepository.save(payment); // Lưu để lấy paymentId

        // 2. Xây dựng tham số cho VNPay (Theo ajaxServlet.java)
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", tmnCode);

        // Nhân 100 (đã đúng)
        long vnpAmount = amount.multiply(new BigDecimal(100)).longValue();
        vnp_Params.put("vnp_Amount", String.valueOf(vnpAmount));
        vnp_Params.put("vnp_CurrCode", "VND");

        // Không có bankCode (Thanh toán qua cổng VNPAY)

        vnp_Params.put("vnp_TxnRef", String.valueOf(payment.getPaymentId()));
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + orderId);
        vnp_Params.put("vnp_OrderType", "other");

        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", returnUrl); // URL Frontend (từ config)

        // SỬA LỖI IP: Dùng 127.0.0.1 (Sandbox chấp nhận IP này)
        vnp_Params.put("vnp_IpAddr", "127.0.0.1");

        vnp_Params.put("vnp_IpnURL", ipnUrl); // URL Backend (từ config)

        // Đặt thời gian
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));

        cld.add(Calendar.MINUTE, 15); // Hết hạn sau 15 phút
        vnp_Params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

        // 3. Tạo URL thanh toán (Gọi hàm đã sửa)
        String paymentUrl = VnPayConfig.getPaymentUrl(vnp_Params, hashSecret, vnpUrl);

        return paymentUrl;
    }
}