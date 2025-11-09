package com.josephhieu.paymentservice.config;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.StringJoiner;

// Lớp này chứa logic bảo mật Hashing của VNPay
public class VnPayConfig {

    // Hàm băm (hash) HMAC-SHA512
    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }

    // Hàm tạo URL (đã bao gồm vnp_SecureHash)
    public static String getPaymentUrl(Map<String, String> paramsMap, String secretKey, String vnpUrl) {
        StringJoiner sj = new StringJoiner("&");
        paramsMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> {
                    try {
                        sj.add(entry.getKey() + "=" + URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString()));
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });

        String queryParams = sj.toString();
        String hashData = queryParams;
        String hmac = hmacSHA512(secretKey, hashData);

        return vnpUrl + "?" + queryParams + "&vnp_SecureHash=" + hmac;
    }
}