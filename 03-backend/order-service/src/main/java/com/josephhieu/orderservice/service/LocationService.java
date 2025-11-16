package com.josephhieu.orderservice.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;

/**
 * Service tiện ích (utility) để xử lý các logic liên quan đến
 * vị trí, tọa độ GPS và tính toán khoảng cách.
 */
@Service
public class LocationService {

    // Bán kính của Trái Đất (tính bằng Kilometers)
    private static final int EARTH_RADIUS_KM = 6371;

    /**
     * Tính khoảng cách giữa 2 điểm GPS (công thức Haversine)
     * (Sử dụng BigDecimal để tương thích với Entity)
     *
     * @return Khoảng cách bằng Kilometers (km)
     */
    public double calculateDistance(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {

        // Chuyển đổi sang double để tính toán
        double dLat = Math.toRadians(lat2.doubleValue() - lat1.doubleValue());
        double dLon = Math.toRadians(lon2.doubleValue() - lon1.doubleValue());

        double lat1Rad = Math.toRadians(lat1.doubleValue());
        double lat2Rad = Math.toRadians(lat2.doubleValue());

        // Công thức Haversine
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c; // Trả về km
    }
}