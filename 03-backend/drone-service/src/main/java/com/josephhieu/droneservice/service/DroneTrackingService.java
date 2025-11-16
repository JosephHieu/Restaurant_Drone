package com.josephhieu.droneservice.service;

import com.josephhieu.droneservice.entity.Delivery;
import com.josephhieu.droneservice.entity.Drone;
import com.josephhieu.droneservice.repository.DeliveryRepository;
import com.josephhieu.droneservice.repository.DroneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DroneTrackingService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private DroneRepository droneRepository;
    @Autowired
    private DeliveryRepository deliveryRepository;

    // Ngưỡng đến nơi (0.0001 độ ~ 11 mét)
    private static final BigDecimal ARRIVAL_THRESHOLD = new BigDecimal("0.0001");
    // "Tốc độ" di chuyển mỗi 3 giây
    private static final BigDecimal STEP = new BigDecimal("0.0001");


    @Scheduled(fixedRate = 3000) // 3 giây
    @Transactional
    public void simulateDroneMovement() {
        List<Drone> activeDrones = droneRepository.findAllByStatus("DELIVERING");

        for (Drone drone : activeDrones) {

            Optional<Delivery> deliveryOpt = deliveryRepository.findByDroneAndStatus(drone, "DELIVERING");
            if (deliveryOpt.isEmpty()) continue;

            Delivery delivery = deliveryOpt.get();
            BigDecimal endLat = delivery.getEndLat();
            BigDecimal endLng = delivery.getEndLng();

            // Tính khoảng cách
            BigDecimal latDiff = endLat.subtract(drone.getCurrentLat()).abs();
            BigDecimal lngDiff = endLng.subtract(drone.getCurrentLng()).abs();

            // 1. KIỂM TRA ĐÃ ĐẾN NƠI
            if (latDiff.compareTo(ARRIVAL_THRESHOLD) < 0 && lngDiff.compareTo(ARRIVAL_THRESHOLD) < 0) {

                delivery.setStatus("COMPLETED");
                delivery.setCompletedAt(LocalDateTime.now());
                deliveryRepository.save(delivery);

                drone.setStatus("IDLE"); // <-- TRỞ NÊN RẢNH RỖI
                droneRepository.save(drone);

                // Gửi thông báo "COMPLETED"
                Map<String, Object> finalData = new HashMap<>();
                finalData.put("orderId", delivery.getOrderId());
                finalData.put("status", "COMPLETED");
                messagingTemplate.convertAndSend("/topic/order-location/" + delivery.getOrderId(), finalData);
                messagingTemplate.convertAndSend("/topic/admin/locations", finalData);

                continue; // Dừng, không di chuyển drone này nữa
            }

            // 2. CHƯA ĐẾN NƠI -> DI CHUYỂN "THÔNG MINH"

            // Di chuyển Vĩ độ (Lat)
            if (drone.getCurrentLat().compareTo(endLat) < 0) { // Đang ở phía Nam
                drone.setCurrentLat(drone.getCurrentLat().add(STEP)); // Bay về phía Bắc
            } else if (drone.getCurrentLat().compareTo(endLat) > 0) { // Đang ở phía Bắc
                drone.setCurrentLat(drone.getCurrentLat().subtract(STEP)); // Bay về phía Nam
            }

            // Di chuyển Kinh độ (Lng)
            if (drone.getCurrentLng().compareTo(endLng) < 0) { // Đang ở phía Tây
                drone.setCurrentLng(drone.getCurrentLng().add(STEP)); // Bay về phía Đông
            } else if (drone.getCurrentLng().compareTo(endLng) > 0) { // Đang ở phía Đông
                drone.setCurrentLng(drone.getCurrentLng().subtract(STEP)); // Bay về phía Tây
            }

            droneRepository.save(drone);

            // 3. Gửi tọa độ (Như cũ)
            Map<String, Object> gpsData = new HashMap<>();
            gpsData.put("droneId", drone.getDroneId());
            gpsData.put("lat", drone.getCurrentLat());
            gpsData.put("lng", drone.getCurrentLng());
            gpsData.put("status", drone.getStatus());
            gpsData.put("orderId", delivery.getOrderId());

            messagingTemplate.convertAndSend("/topic/order-location/" + delivery.getOrderId(), gpsData);
            messagingTemplate.convertAndSend("/topic/admin/locations", gpsData);
        }
    }
}