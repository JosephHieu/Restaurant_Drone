package com.josephhieu.droneservice.service;

import com.josephhieu.droneservice.entity.Delivery;
import com.josephhieu.droneservice.entity.Drone;
import com.josephhieu.droneservice.repository.DeliveryRepository;
import com.josephhieu.droneservice.repository.DroneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate; // <-- BỔ SUNG
import org.springframework.scheduling.TaskScheduler; // <-- BỔ SUNG
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant; // <-- BỔ SUNG
import java.time.LocalDateTime; // <-- BỔ SUNG
import java.util.HashMap; // <-- BỔ SUNG
import java.util.List;
import java.util.Map; // <-- BỔ SUNG

@Service
public class DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private DroneRepository droneRepository;

    // --- BỔ SUNG 2 DEPENDENCY NÀY ---
    @Autowired
    private TaskScheduler taskScheduler;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    // ----------------------------------

    @Transactional
    public Delivery createDelivery(Integer orderId, BigDecimal startLat, BigDecimal startLng, BigDecimal endLat, BigDecimal endLng) {

        // 1. Tìm drone (Giữ nguyên)
        List<Drone> idleDrones = droneRepository.findAllByStatus("IDLE");
        if (idleDrones.isEmpty()) {
            throw new RuntimeException("Không tìm thấy drone rảnh rỗi.");
        }
        Drone assignedDrone = idleDrones.get(0);

        // 2. Tạo chuyến giao hàng (Giữ nguyên)
        Delivery delivery = new Delivery();
        delivery.setOrderId(orderId);
        delivery.setDrone(assignedDrone);
        // SỬA: Đặt là DELIVERING ngay lập tức
        delivery.setStatus("DELIVERING");
        delivery.setStartLat(startLat);
        delivery.setStartLng(startLng);
        delivery.setEndLat(endLat);
        delivery.setEndLng(endLng);
        Delivery savedDelivery = deliveryRepository.save(delivery);

        // 3. Cập nhật drone (Sửa)
        assignedDrone.setStatus("DELIVERING");
        assignedDrone.setCurrentLat(startLat); // <-- Gán vị trí bắt đầu
        assignedDrone.setCurrentLng(startLng); // <-- Gán vị trí bắt đầu
        droneRepository.save(assignedDrone);

        // 4. --- BỔ SUNG: LÊN LỊCH HOÀN THÀNH SAU 5 GIÂY ---
        scheduleDeliveryCompletion(savedDelivery.getDeliveryId(), assignedDrone.getDroneId());
        // ------------------------------------------------

        return savedDelivery;
    }

    /**
     * Hàm này tạo một tác vụ (task) chạy một lần duy nhất
     * 5 giây trong tương lai.
     */
    private void scheduleDeliveryCompletion(Integer deliveryId, Integer droneId) {
        // Tạo thời điểm 5 giây kể từ bây giờ
        Instant startTime = Instant.now().plusSeconds(5);

        // Tạo tác vụ (task)
        Runnable task = () -> {
            // (Code này sẽ chạy sau 5 giây)

            // Lấy lại các đối tượng từ CSDL để đảm bảo chúng mới nhất
            Delivery delivery = deliveryRepository.findById(deliveryId)
                    .orElse(null);
            Drone drone = droneRepository.findById(droneId)
                    .orElse(null);

            if (delivery == null || drone == null) {
                System.err.println("Không tìm thấy Delivery hoặc Drone để hoàn thành.");
                return;
            }

            // Cập nhật trạng thái
            delivery.setStatus("COMPLETED");
            delivery.setCompletedAt(LocalDateTime.now());
            deliveryRepository.save(delivery);

            drone.setStatus("IDLE");
            // (Giữ nguyên vị trí drone ở chỗ khách hàng)
            droneRepository.save(drone);

            // Gửi thông báo "COMPLETED" qua WebSocket
            Map<String, Object> finalData = new HashMap<>();
            finalData.put("orderId", delivery.getOrderId());
            finalData.put("status", "COMPLETED");

            messagingTemplate.convertAndSend("/topic/order-location/" + delivery.getOrderId(), finalData);
            messagingTemplate.convertAndSend("/topic/admin/locations", finalData);

            System.out.println("Đơn hàng " + deliveryId + " đã tự động hoàn thành sau 5 giây.");
        };

        // Lên lịch cho tác vụ
        taskScheduler.schedule(task, startTime);
    }
}